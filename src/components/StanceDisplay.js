import React from 'react';
import { stanceScale } from '../state-data';

// Helper to get color class
const getStanceBarColorClass = (value) => {
    const intValue = parseInt(value, 10);
    if (intValue <= 2) return 'bg-blue-600';
    if (intValue === 3) return 'bg-blue-400';
    if (intValue === 4) return 'bg-purple-500';
    if (intValue === 5) return 'bg-red-400';
    if (intValue >= 6) return 'bg-red-600';
    return 'bg-gray-500';
};

const getStanceTextColorClass = (value) => {
    const intValue = parseInt(value, 10);
    if (intValue <= 2) return 'text-blue-400';
    if (intValue === 3) return 'text-blue-300';
    if (intValue === 4) return 'text-purple-300';
    if (intValue === 5) return 'text-red-300';
    if (intValue >= 6) return 'text-red-500';
    return 'text-gray-400';
};

const StanceDisplay = ({ value, label, type = 'economic', showBar = true }) => {
    if (!value) return <span className="text-gray-400">Not Set</span>;
    const colorClass = getStanceBarColorClass(value);
    const textColorClass = getStanceTextColorClass(value);
    const barWidth = `${((parseInt(value, 10) - 1) / 6) * 100}%`;
    return (
        <div className="flex flex-col gap-1 w-full">
            <span className={`font-semibold text-xs ${textColorClass}`}>{label || 'Moderate'}</span>
            {showBar && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: barWidth }}></div>
                </div>
            )}
        </div>
    );
};

export default StanceDisplay; 