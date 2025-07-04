import React from 'react';
import { diff } from 'json-diff-ts';
import { format } from 'date-fns';

const JSONComparison = ({ firstDate, secondDate ,json1, json2 }) => {

  // Function to render a JSON value, handling objects and arrays dynamically
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      // Render nested objects or arrays as stringified JSON for better readability
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }
    return value;
  };

  // Function to render the JSON object with dynamic color formatting based on differences
  const renderJson = (json, json2) => {
    const allKeys = new Set([...Object.keys(json), ...Object.keys(json2)]);
    
    return Array.from(allKeys).map((key) => {
      const value1 = json[key];
      const value2 = json2[key];

      let color = ''; // Default to no color (or default text color)
      let diff = null;

      if (json2[key] === undefined) {
        // Key is present in json1 but not in json2 (removed) => red in json2
        color = 'red';
        diff = value1;
      } else if (json[key] === undefined) {
        // Key is present in json2 but not in json1 (added) => green in json2
        color = 'green';
        diff = value2;
      } else if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        // Key exists in both JSONs but values are different (modified) => green
        color = 'green';
        diff = value2;
      } else {
        // If no differences, show default text color (no color)
        diff = value1;
      }

      return (
        <div key={key} style={{ marginBottom: '8px', display: 'flex' }}>
          <strong>{key}:</strong>
          <span
            style={{
              color: color,  // Set color based on the condition
              display: 'inline-block',
              marginLeft: '10px',
            }}
          >
            {renderValue(diff)}
          </span>
        </div>
      );
    });
  };

  return (
    <div className='custom-scroll' style={{ display: 'flex' }}>
      <div className='mr-4 overflow-auto' style={{ maxHeight: 'calc(100vh - 10rem)' }}>
        <h5 className='mb-3'>{firstDate ? format(firstDate, 'yyyy-MM-dd') : ''}</h5>
        {renderJson(json2, json1)}
      </div>
      <div className='overflow-auto' style={{ maxHeight: 'calc(100vh - 10rem)' }}>
        <h5 className='mb-3'>{secondDate ? format(secondDate, 'yyyy-MM-dd') : ''}</h5>
        {renderJson(json1, json2)}
      </div>
    </div>
  );
};

export default JSONComparison;
