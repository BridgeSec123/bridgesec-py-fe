import DatePicker from "@/components/ui/DatePicker/DatePicker";
import { Button, Notification, Tag, toast, Spinner } from "@/components/ui";
import axios from "axios";
import FormatJson from "../utils/jsonReader/FormatJson";
import { useEffect, useRef, useState } from "react";
import { HiArrowsExpand, HiChevronDown, HiChevronUp, HiOutlineX } from "react-icons/hi";
import { format } from "date-fns";
import axiosInstance from "./axiosConfig";

const ViewJson = (props) => {
    const [isFormattedView, setIsFormattedView] = useState(false);
    const [expWindow, setExpWindow] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false); // Local state for Restore button
    const expWindowElm = useRef(null);

    const toggleView = () => {
        setIsFormattedView(!isFormattedView);
    };

    const handleDateChange = (selectedDate) => {
        // Validate selectedDate
        const validDate = selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate : new Date();
        console.log('Selected Date: ', validDate);
        props.onChange(validDate);
    };

    const copyToClipboard = () => {
        const jsonString = JSON.stringify(props.data, null, 2);
        navigator.clipboard.writeText(jsonString)
            .then(() => {
                toast.push(
                    <Notification title="Success" type="success">
                        JSON copied to clipboard!
                    </Notification>
                );
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
            });
    };

    const goFullScreen = () => {
        const elem = expWindowElm.current;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        setExpWindow(true);
    };

    const exitFullScreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        setExpWindow(false);
    };

    const handleFullScreenChange = () => {
        if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            setExpWindow(true);
        } else {
            setExpWindow(false);
        }
    };

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('msfullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('msfullscreenchange', handleFullScreenChange);
        };
    }, []);

    const handleRestore = async () => {
        setRestoreLoading(true);
        try {
            if (!props.entityName || !props.date) {
                console.error('Missing required props: entityName or date');
                toast.push(
                    <Notification title="Error" type="danger">
                        Entity name and date are required.
                    </Notification>
                );
                throw new Error('Entity name and date are required');
            }

            const formattedDate = format(props.date, 'yyyy-MM-dd');
            const formattedData = {
                data: Array.isArray(props.data) ? props.data : [],
            };

            // console.log('Entity:', props.entityName);
            // console.log('Formatted Date:', formattedDate);
            // console.log('Formatted Data:', formattedData);

            const baseURL = import.meta.env.VITE_FIREBASE_API_BASE_URL;
            if (!baseURL) {
                console.error('API base URL is not defined');
                toast.push(
                    <Notification title="Error" type="danger">
                        API configuration error
                    </Notification>
                );
                throw new Error('API base URL is not configured');
            }

            // POST request
            const res = await axiosInstance.post(
                `${baseURL}/restore/${formattedDate}/${props.entityName}/`,
                formattedData
            );
            if (res.status === 200 || res.status === 201) {
                console.log('Restore successful:', res.data);
                toast.push(
                    <Notification title="Success" type="success">
                        Previous version successfully restored.
                    </Notification>
                );
                return res.data; // Return response data for caller
            } else {
                // Handle non-success status codes (e.g., 400, 404, 500)
                console.error('Restore failed with status:', res.status);
                toast.push(
                    <Notification title="Error" type="danger">
                        Restore Failed: Server responded with status {res.status}
                    </Notification>
                );
                throw new Error(`Restore Failed: Server responded with status ${res.status}`);
            }
        } catch (error) {
            console.error('Restore failed:', error.message);
            toast.push(
                <Notification title="Error" type="danger">
                    Restore Failed: {error.message}
                </Notification>
            );
            throw error; 
        } finally {
            setRestoreLoading(false);
        }
    };



    return (
        <div ref={expWindowElm} className="dark:bg-gray-800 bg-white">
            <div className="flex justify-between gap-4 mb-3 mt-2 mr-1">
                <DatePicker
                    size="sm"
                    placeholder={props.placeholder}
                    value={props.date instanceof Date && !isNaN(props.date) ? props.date : null}
                    onChange={handleDateChange}
                    disabled={props.jsonLoading || restoreLoading}
                />
                <Button onClick={handleRestore} disabled={props.jsonLoading || restoreLoading}>
                    {restoreLoading ? <Spinner size="sm" /> : 'Restore'}
                </Button>
            </div>
            <div className="border p-3 rounded-lg code-card custom-scroll relative group">
                <div className="accordion-triggers absolute left-2 top-0 translate-y-[-50%] hidden group-hover:flex">
                    <Button
                        className="scale-[0.6]"
                        shape="circle"
                        size="xs"
                        icon={!props.expStatus.exp ? <HiChevronDown /> : <HiChevronUp />}
                        onClick={() => {
                            props.expStatus.setexp(!props.expStatus.exp);
                        }}
                        disabled={props.jsonLoading || restoreLoading}
                    />
                    <Button
                        className="scale-[0.6]"
                        shape="circle"
                        size="xs"
                        icon={expWindow ? <HiOutlineX /> : <HiArrowsExpand />}
                        onClick={() => {
                            if (expWindow) {
                                exitFullScreen();
                            } else {
                                goFullScreen();
                            }
                        }}
                        disabled={props.jsonLoading || restoreLoading}
                    />
                </div>
                <div className="flex justify-end absolute right-3 top-3 hidden group-hover:flex">
                    <Tag
                        onClick={toggleView}
                        className="tag dark:bg-gray-700 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-50 bg-warning-subtle cursor-pointer"
                        disabled={props.jsonLoading || restoreLoading}
                    >
                        <span className="capitalize font-semibold text-warning">
                            {isFormattedView ? 'View Object' : 'View JSON'}
                        </span>
                    </Tag>
                    {isFormattedView && props.data && Object.keys(props.data).length > 0 ? (
                        <Tag
                            onClick={copyToClipboard}
                            className="ml-2 cursor-pointer tag dark:bg-gray-700 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-50 bg-success-subtle"
                            disabled={props.jsonLoading || restoreLoading}
                        >
                            <span className="capitalize font-semibold text-success">Copy</span>
                        </Tag>
                    ) : null}
                </div>
                <div
                    style={
                        props.expStatus.exp && !expWindow
                            ? { height: 'calc(100vh - 19rem)' }
                            : expWindow
                                ? { height: 'calc(100vh - 6rem)' }
                                : { height: 'calc(1.6rem)' }
                    }
                    className="overflow-scroll transition-all"
                >
                    {props.jsonLoading || restoreLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner size="lg" />
                            <span className="ml-2 text-gray-900 dark:text-gray-50">Loading...</span>
                        </div>
                    ) : props.data && Object.keys(props.data).length > 0 ? (
                        isFormattedView ? (
                            <pre>{JSON.stringify(props.data, null, 2)}</pre>
                        ) : (
                            <div><FormatJson json={props.data} /></div>
                        )
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <span className="text-gray-900 dark:text-gray-50">No data available</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewJson;