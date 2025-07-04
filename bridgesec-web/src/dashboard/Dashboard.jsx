import { Button, Card, FormItem, Select } from '@/components/ui';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import ViewJson from './ViewJson';
import { format } from 'date-fns';
import { diff } from 'json-diff-ts';
import JSONComparison from './JSONComparison';
import JsonDiff from './JsonDiff';
import axiosInstance from './axiosConfig.js';

const Dashboard = () => {

    const apiBaseUrl = import.meta.env.VITE_FIREBASE_API_BASE_URL;

    const [entityTypeOptions, setEntityTypeOptions] = useState([]);
    const [entityNameOptions, setEntityNameOptions] = useState([]);
    const [mode, setMode] = useState('');
    const [selectedEntityTypeId, setSelectedEntityTypeId] = useState('');
    const [selectedEntityId, setSelectedEntityId] = useState('');
    
    const [selectedEntityName, setSelectedEntityName] = useState(null); 

    const [primaryJson, setPrimaryJson] = useState([]);
    const [comparisonJson, setComparisonJson] = useState([]);
    const [firstDate, setFirstDate] = useState(null);
    const [secondDate, setSecondDate] = useState(null);
    const [comparedJson, setComparedJson] = useState([]);
    const [selectStorageType, setstorageType] = useState([]);
    const [jsonViewExpanded, setjsonViewExpanded] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEntityTypes();
    }, [])

    // get the entity tpye using MONGO DB
    const fetchEntityTypes = async() => {
        setLoading(true); // Show loading indicator
        try {
            const res = await axiosInstance.get(`${apiBaseUrl}/dashboard/entityTypes`);
            const options = res.data.map((item) => ({
                entityTypeId: item.entityTypeId,
                label: item.name,
                value: item.name,
                entityPropertyName: item.entityPropertyName,
                storageType: item.storageType,
            }));
            setEntityTypeOptions(options);
        } catch (err) {
            console.error("Error fetching entity types: ", err);
        } finally {
            setLoading(false); // Hide loading indicator
        }
       
    }

    //get the entity name
    const fetchEntityNames = async (selectedOption) => {
        
        if (!selectedOption) return;
        setLoading(true); // Show loading indicator
        
        try {
            const params = {
                entityTypeId: selectedOption.entityTypeId,
                entityPropertyName: selectedOption.entityPropertyName,
                storageType: selectedOption.storageType,
            };
            const res = await axiosInstance.post(`${apiBaseUrl}/dashboard/entities`, params);
            const options = res.data.map((item) => ({
                id: item.id,
                label: item.label,
                value: item,
                storageType: item.storageType,
            }));
            
            setEntityNameOptions(options);
        } catch (err) {
            console.error("Error fetching entity names: ", err);
        } finally {
            setLoading(false); // Hide loading indicator
        }
       
    }

    // handle entity type change 
    const handleEntityTypeChange = (selectedOption) => {
       
        if (selectedOption) {
            // Clear previous Entity Name options and selected value
            setEntityNameOptions([]);
            // Preserve selected entity name if it matches the new type
            if (selectedEntityName && selectedOption.entityPropertyName === selectedEntityName.entityPropertyName) {
                // If the selected name is still valid for the new type, keep it
                fetchEntityNames(selectedOption);
            } else {
                // Otherwise clear it
                setSelectedEntityId('');
                setSelectedEntityName(null);
            }
            fetchEntityNames(selectedOption);
            setSelectedEntityTypeId(selectedOption.entityTypeId); // Update selected Entity Type ID
        } else {
            setEntityTypeOptions([]); // Clear Entity Type options if nothing is selected
        }
    }

    const formatDate = (date) => {
        // Format date as 'YYYY-MM-DD' or as required by your backend
        return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"); // ISO 8601 format
    };
    const handleEntityNameChange = async (selectedOption) => {
        const formattedDate = formatDate(new Date());
        if (selectedOption) {
            setSelectedEntityId(selectedOption.id);
            setSelectedEntityName(selectedOption);
            setstorageType(selectedOption.storageType);
            const params = {
                entityTypeId: selectedEntityTypeId,
                entityId: selectedOption.id,
                createdDate: formattedDate,
                storageType: selectedOption.storageType,
            };
            await getEntityJson(params, 'first');
            await getEntityJson(params, 'second');
            setFirstDate(new Date());
            setSecondDate(new Date());
            setComparedJson([]);
        }
    }

    //load auto complete options
    const loadEntityOptions = (inputValue, callback) => {
        const filteredOptions = enTypeNameOpt.filter((option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        setTimeout(() => {
            callback(filteredOptions);
        }, 1000)
    }

    const fetchComparedJson = (json1, json2) => {
        const json = diff(json1, json2);
        setComparedJson(json);
    }

    // Function to handle date change for both date pickers
    const handleDateChange = (date, isFirst) => {
        if (isFirst) {
            setFirstDate(date);
            fetchJsonData(date, 'first');
        } else {
            setSecondDate(date);
            fetchJsonData(date, 'second');
        }
    };

    // get the entitytype 
    const fetchJsonData = async (date, whichDate) => {
        if (selectedEntityTypeId) {
            const formattedDate = formatDate(date);
            const params = {
                entityTypeId: selectedEntityTypeId,
                entityId: selectedEntityId,
                createdDate: formattedDate,
                storageType: selectStorageType,
            };
            await getEntityJson(params, whichDate);

        } else {
            console.warn('Error: No entity type or ID selected.');
        }
    };

    const getEntityJson = async (params, whichDate) => {
        try {
            const res = await axiosInstance.post(`${apiBaseUrl}/dashboard/entity`, params, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (whichDate === 'first') {
                setPrimaryJson(res.data);
                fetchComparedJson(res.data, comparisonJson);
            } else {
                setComparisonJson(res.data);
                fetchComparedJson(primaryJson, res.data);
            }
        } catch (err) {
            if (err.response) {
                console.error("Error fetching data:", err.response.data);
            } else {
                console.error("Error fetching data:", err.message);
            }

        }
    };
    const customStyles = {
        codeFoldContent: {
            marginLeft: '0', // Adjust left margin
        },
        code: {
            fontFamily: 'Courier, monospace', // Monospaced font
            fontSize: '13px', // Adjust the font size
            whiteSpace: 'pre', // Preserve whitespace
        },
        line: {
            fontSize: '13px', // Adjust font size for line numbers or lines
        },
    };

    return (
        <div className='card card-border'>
            <div className='card-body p-2'>
                <div className='flex gap-4 mb-1 bg-[#b9b9b90a] p-2 rounded-lg border border-[#eeeeee9e] dark:bg-[#ffffff0d] dark:border-[#eeeeee1a]'>
                    <div className='flex-1'>
                        <FormItem label='Entity Type' className='mb-0'>
                            <Select size='sm' options={entityTypeOptions} onChange={handleEntityTypeChange} isLoading={loading}/>
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
                                value={selectedEntityName}
                            />
                        </FormItem>
                    </div>
                    <div className='mt-6 pt-1'>
                        <Button variant="light" className='mr-3' onClick={() => setMode("View")}>View</Button>
                        <Button variant="light" onClick={() => {
                            setMode("Compare");
                            if (primaryJson) {
                                setComparisonJson(primaryJson);
                            }
                            setFirstDate(new Date());
                            setSecondDate(new Date());
                            // Load both primary and comparison JSONs for the initial compare
                            fetchJsonData(new Date(), 'first');
                            fetchJsonData(new Date(), 'second');
                        }}>Compare</Button>
                    </div>

                </div>
                {
                    mode === 'View' && (
                        <div className='mt-4'>
                            <ViewJson data={primaryJson} date={firstDate} expStatus={{ exp: jsonViewExpanded, setexp: setjsonViewExpanded }} placeholder={'Current Date'} onChange={(date) => handleDateChange(date, true)}></ViewJson>
                        </div>
                    )
                }
                {
                    mode === 'Compare' && (
                        <>
                            <div className='flex justify-between gap-4'>
                                <div className='flex-1' style={{ overflowY: 'auto' }}>
                                    <ViewJson data={primaryJson} date={firstDate} expStatus={{ exp: jsonViewExpanded, setexp: setjsonViewExpanded }} placeholder={'Pick a Date'} onChange={(date) => handleDateChange(date, true)}></ViewJson>
                                </div>
                                <div className='flex-1' style={{ overflowY: 'auto' }}>
                                    <ViewJson data={comparisonJson} date={secondDate} expStatus={{ exp: jsonViewExpanded, setexp: setjsonViewExpanded }} placeholder={'Current Date'} onChange={(date) => handleDateChange(date, false)}></ViewJson>
                                </div>
                            </div>
                            <Card className='mt-4 json-compair-card overflow-scroll rounded-md custom-scroll' style={{ maxHeight: 'calc(100vh - 6rem)' }}>
                                <div className='rounded-lg overflow-hidden'>
                                    <JsonDiff sourceLeft={primaryJson} sourceRight={comparisonJson}></JsonDiff>
                                </div>
                            </Card>
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default Dashboard;