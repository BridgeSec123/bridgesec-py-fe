import DatePicker from "@/components/ui/DatePicker/DatePicker";
import { Button, Notification, Tag, toast, Spinner } from "@/components/ui";
import axios from "axios";
import FormatJson from "../utils/jsonReader/FormatJson";
import { useEffect, useRef, useState } from "react";
import { HiArrowsExpand, HiChevronDown, HiChevronUp, HiOutlineX } from "react-icons/hi";

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

    const handleRestore = () => {
        console.log('restore');
        setRestoreLoading(true);
        axios.get(`https://run.mocky.io/v3/b22230ec-9795-41a2-93a6-ab8691aeedf1`).then((res) => {
            if (res.data.length > 0) {
                const fetchedDate = new Date(res.data[0].createDate);
                if (!isNaN(fetchedDate)) {
                    props.onChange(fetchedDate);
                    toast.push(
                        <Notification title="Success" type="success">
                            Previous version successfully restored.
                        </Notification>
                    );
                } else {
                    throw new Error("Invalid date in response");
                }
            } else {
                throw new Error("No data in response");
            }
        }).catch((err) => {
            console.error("Error: ", err);
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to restore previous version.
                </Notification>
            );
        }).finally(() => {
            setRestoreLoading(false);
        });
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