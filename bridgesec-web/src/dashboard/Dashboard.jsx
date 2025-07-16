import { Button, Card, FormItem, Select, Notification, toast } from '@/components/ui';
import { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import ViewJson from './ViewJson';
import { format } from 'date-fns';
import { diff } from 'json-diff-ts';
import JsonDiff from './JsonDiff';
import axiosInstance from './axiosConfig.js';

const Dashboard = () => {
    const apiBaseUrl = import.meta.env.VITE_FIREBASE_API_BASE_URL;

    const [entityTypeOptions, setEntityTypeOptions] = useState([]);
    const [entityNameOptions, setEntityNameOptions] = useState([]);
    const [mode, setMode] = useState('');
    const [selectedEntityType, setSelectedEntityType] = useState('');
    const [selectedEntityName, setSelectedEntityName] = useState(null);
    const [selectedEntityOption, setSelectedEntityOption] = useState(null);
    const [primaryJson, setPrimaryJson] = useState([]);
    const [comparisonJson, setComparisonJson] = useState([]);
    const [firstDate, setFirstDate] = useState(null);
    const [secondDate, setSecondDate] = useState(null);
    const [comparedJson, setComparedJson] = useState([]);
    const [selectStorageType, setStorageType] = useState([]);
    const [jsonViewExpanded, setJsonViewExpanded] = useState(true);
    const [loading, setLoading] = useState(false); // For entity type/name fetching
    const [jsonLoading, setJsonLoading] = useState(false); // For JSON data fetching

    useEffect(() => {
        fetchEntityTypes();
    }, []);

    const fetchEntityTypes = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${apiBaseUrl}/resources/`);
            const options = res.data.data.map((item) => ({
                label: item,
                value: item,
            }));
            setEntityTypeOptions(options);
        } catch (err) {
            console.error("Error fetching entity types: ", err);
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to load entity types.
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEntityTypeChange = (selectedOption) => {
        if (selectedOption) {
            setLoading(true);
            if (selectedOption.value !== selectedEntityType) {
                setEntityNameOptions([]);
                setSelectedEntityName(null);
                setSelectedEntityOption(null);
                fetchEntityNames(selectedOption);
            }
            setSelectedEntityType(selectedOption.value);
        } else {
            setEntityTypeOptions([]);
            setEntityNameOptions([]);
            setSelectedEntityName(null);
            setSelectedEntityOption(null);
            setSelectedEntityType('');
            
        }
        setLoading(false);
    };

    const fetchEntityNames = async (selectedOption) => {
        if (!selectedOption) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${apiBaseUrl}/resources/?entity_type=${selectedOption.value}`);
            const options = res.data.data.map((item) => ({
                label: item,
                value: item,
                entityType: selectedOption.value,
            }));
            setEntityNameOptions(options);
        } catch (err) {
            console.error("Error fetching entity names: ", err);
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to load entity names.
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return format(date, "yyyy-MM-dd"); // ISO 8601 format
    };

    const handleEntityNameChange = async (selectedOption) => {
        if (selectedOption) {
            setLoading(true);
            setSelectedEntityOption(selectedOption);
            setSelectedEntityName(selectedOption.value);
            const newDate = new Date();
            const formattedDate = formatDate(newDate);
            const params = {
                entityType: selectedEntityType,
                entityName: selectedOption.value,
                createdDate: formattedDate,
            };
            setJsonLoading(true);
            setFirstDate(newDate);
            setSecondDate(newDate);
            try {
                await Promise.all([
                    getEntityJson(params, 'first'),
                    getEntityJson(params, 'second'),
                ]);
            } finally {
                setLoading(false);
                setJsonLoading(false);
            }
            setComparedJson([]);
        }
    };

    const loadEntityOptions = (inputValue, callback) => {
        const filteredOptions = entityNameOptions.filter((option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        setTimeout(() => {
            callback(filteredOptions);
        }, 1000);
    };

    const fetchComparedJson = (json1, json2) => {
        const json = diff(json1, json2);
        setComparedJson(json);
    };

    const handleDateChange = (date, isFirst) => {
        if (date instanceof Date && !isNaN(date)) {
            if (isFirst) {
                setFirstDate(date);
                setJsonLoading(true);
                fetchJsonData(date, 'first');
            } else {
                setSecondDate(date);
                setJsonLoading(true);
                fetchJsonData(date, 'second');
            }
        } else {
            console.warn('Invalid date provided:', date);
            toast.push(
                <Notification title="Error" type="danger">
                    Please select a valid date.
                </Notification>
            );
        }
    };

    const fetchJsonData = async (date, whichDate) => {
        if (selectedEntityType && selectedEntityName && date instanceof Date && !isNaN(date)) {
            const formattedDate = formatDate(date);
            const params = {
                entityType: selectedEntityType,
                entityName: selectedEntityName,
                createdDate: formattedDate,
            };
            await getEntityJson(params, whichDate);
        } else {
            console.warn('Error: No entity type, name, or valid date selected.', {
                entityType: selectedEntityType,
                entityName: selectedEntityName,
                date,
            });
            setJsonLoading(false);
            toast.push(
                <Notification title="Error" type="danger">
                    Please select an entity type, entity name, and a valid date.
                </Notification>
            );
        }
    };

    const getEntityJson = async (params, whichDate) => {
        try {
            const res = await axiosInstance.get(`${apiBaseUrl}/data/${params.createdDate}/${params.entityName}`);
            if (whichDate === 'first') {
                setPrimaryJson(res.data);
                fetchComparedJson(res.data, comparisonJson);
            } else {
                setComparisonJson(res.data);
                fetchComparedJson(primaryJson, res.data);
            }
        } catch (err) {
            console.error("Error fetching data, err.response ? err.response.data : "+err.message);
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to load JSON data.
                </Notification>
            );
        } finally {
            setJsonLoading(false);
        }
    };

    const handleViewClick = () => {
        setMode("View");
        if (selectedEntityType && selectedEntityName) {
            const newDate = new Date();
            setFirstDate(newDate);
            setJsonLoading(true);
            setTimeout(() => {
                fetchJsonData(newDate, 'first');
            }, 0);
        } else {
            toast.push(
                <Notification title="Error" type="danger">
                    Please select an entity type and name.
                </Notification>
            );
        }
    };

    const handleCompareClick = () => {
        setMode("Compare");
        if (selectedEntityType && selectedEntityName) {
            const newDate = new Date();
            setFirstDate(newDate);
            setSecondDate(newDate);
            setJsonLoading(true);
            setTimeout(() => {
                Promise.all([
                    fetchJsonData(newDate, 'first'),
                    fetchJsonData(newDate, 'second'),
                ]).finally(() => setJsonLoading(false));
            }, 0);
        } else {
            toast.push(
                <Notification title="Error" type="danger">
                    Please select an entity type and name.
                </Notification>
            );
        }
    };


   

    return (
        <div className='card card-border'>
            <div className='card-body p-2'>
                <div className='flex gap-4 mb-1 bg-[#b9b9b90a] p-2 rounded-lg border border-[#eeeeee9e] dark:bg-[#ffffff0d] dark:border-[#eeeeee1a]'>
                    <div className='flex-1'>
                        <FormItem label='Entity Type' className='mb-0'>
                            <Select size='sm' options={entityTypeOptions} onChange={handleEntityTypeChange} isLoading={loading} />
                        </FormItem>
                    </div>
                    <div className='flex-1'>
                        <FormItem label='Entity Name' className='mb-0'>
                            <Select
                                size='sm'
                                cacheOptions
                                defaultOptions={entityNameOptions}
                                loadOptions={loadEntityOptions}
                                componentAs={AsyncSelect}
                                onChange={handleEntityNameChange}
                                value={selectedEntityOption}
                                isLoading={loading}
                                
                                
                            />
                        </FormItem>
                    </div>
                    <div className='mt-6 pt-1'>
                        <Button
                            variant="light"
                            className='mr-3'
                            onClick={handleViewClick}
                            disabled={loading || jsonLoading}
                        >
                            View
                        </Button>
                        <Button
                            variant="light"
                            onClick={handleCompareClick}
                            disabled={loading || jsonLoading}
                        >
                            Compare
                        </Button>
                    </div>
                </div>
                {mode === 'View' && (
                    <div className='mt-4'>
                        <ViewJson
                            key="view-mode"
                            data={primaryJson}
                            date={firstDate}
                            expStatus={{ exp: jsonViewExpanded, setexp: setJsonViewExpanded }}
                            placeholder={'Current Date'}
                            onChange={(date) => handleDateChange(date, true)}
                            jsonLoading={jsonLoading}
                            entityName={selectedEntityName}                            
                            
                        />
                    </div>
                )}
                {mode === 'Compare' && (
                    <>
                        <div className='flex justify-between gap-4'>
                            <div className='flex-1' style={{ overflowY: 'auto' }}>
                                <ViewJson
                                    key="compare-mode-primary"
                                    data={primaryJson}
                                    date={firstDate}
                                    expStatus={{ exp: jsonViewExpanded, setexp: setJsonViewExpanded }}
                                    placeholder={'Pick a Date'}
                                    onChange={(date) => handleDateChange(date, true)}
                                    jsonLoading={jsonLoading}                                    
                                    entityName={selectedEntityName}                                    
                                    
                                />
                            </div>
                            <div className='flex-1' style={{ overflowY: 'auto' }}>
                                <ViewJson
                                    key="compare-mode-secondary"
                                    data={comparisonJson}
                                    date={secondDate}
                                    expStatus={{ exp: jsonViewExpanded, setexp: setJsonViewExpanded }}
                                    placeholder={'Current Date'}
                                    onChange={(date) => handleDateChange(date, false)}
                                    jsonLoading={jsonLoading}                                    
                                    entityName={selectedEntityName}                                    
                                    
                                />
                            </div>
                        </div>
                        <Card className='mt-4 json-compare-card overflow-scroll rounded-md custom-scroll' style={{ maxHeight: 'calc(100vh - 6rem)' }}>
                            <div className='rounded-lg overflow-hidden'>
                                <JsonDiff sourceLeft={primaryJson} sourceRight={comparisonJson} />
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;