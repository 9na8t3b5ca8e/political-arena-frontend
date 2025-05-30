import React from 'react';

const ReadOnlyField = ({ label, value, valueHtml, icon }) => (
    <div>
        <span className="text-xs text-gray-400 block">{label}</span>
        <p className="text-sm text-gray-200 flex items-center">
            {icon && React.cloneElement(icon, { className: "mr-1.5 text-gray-400" })}
            {valueHtml || value}
        </p>
    </div>
);

export default ReadOnlyField; 