import React from 'react';

const EditableField = ({ label, name, value, onChange, type = "text", placeholder, disabled = false }) => (
    <div className="mb-2">
        <label htmlFor={name} className="block text-xs font-medium text-gray-300 mb-0.5">{label}</label>
        <input 
            type={type} 
            name={name} 
            id={name} 
            value={value || ''} 
            onChange={onChange} 
            placeholder={placeholder || label} 
            disabled={disabled} 
            className={`w-full p-1.5 bg-gray-600 rounded text-white border border-gray-500 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`} 
        />
    </div>
);

export default EditableField; 