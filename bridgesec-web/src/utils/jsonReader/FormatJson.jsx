import React from 'react';

// Function to format JSON recursively
const formatJson = (json, indent = 0) => {
    // Check if the input is an object before processing
    if (typeof json !== 'object' || json === null) {
        return <div>{String(json)}</div>; // Handle non-object inputs gracefully
    }

    // If the JSON is an array, handle it specifically
    if (Array.isArray(json)) {
        return (
            <div>
                {json.map((item, index) => (
                    <div key={index} style={{ marginLeft: `${indent * 20}px` }}>
                        <strong style={{ display: `none` }}>Item {index + 1}:</strong> {/* Display array index */}
                        <div>{formatJson(item, indent + 1)}</div> {/* Recursive call */}
                    </div>
                ))}
            </div>
        );
    }

    return Object.entries(json).map(([key, value]) => {
        const keyLabel = <strong key={key}>{key}:</strong>;

        // Check for specific keys for special formatting
        if (key === 'href') {
            return (
                <div key={key} style={{ marginLeft: `${indent * 20}px` }}>
                    {keyLabel} {value}
                </div>
            );
        }

        // Check if the value is an object and not null
        if (typeof value === 'object') {
            return (
                <div key={key} style={{ marginLeft: `${indent * 20}px` }}>
                    {keyLabel}
                    <div>{formatJson(value, indent + 1)}</div> {/* Recursive call */}
                </div>
            );
        }

        // For primitive values
        return (
            <div key={key} style={{ marginLeft: `${indent * 20}px` }}>
                {keyLabel} {String(value)}
            </div>
        );
    });
};

// Component to display formatted JSON
const FormatJson = ({ json }) => {
    return <div>{json != 0 ? formatJson(json) : <p>No Object</p>}</div>;
};

export default FormatJson;
