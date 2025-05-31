import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ 
    message, 
    type = 'info', 
    duration = 5000, 
    onClose,
    isVisible = true 
}) => {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
    }, [isVisible]);

    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(() => onClose && onClose(), 300); // Wait for fade out animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    const getToastStyles = () => {
        const baseStyles = "p-4 rounded-lg shadow-lg border max-w-md transform transition-all duration-300 ease-in-out";
        
        if (!show) {
            return `${baseStyles} translate-x-full opacity-0 pointer-events-none`;
        }

        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-800 border-green-600 text-green-100`;
            case 'error':
                return `${baseStyles} bg-red-800 border-red-600 text-red-100`;
            case 'warning':
                return `${baseStyles} bg-yellow-800 border-yellow-600 text-yellow-100`;
            default: // info
                return `${baseStyles} bg-blue-800 border-blue-600 text-blue-100`;
        }
    };

    const getIcon = () => {
        const iconClass = "w-5 h-5 flex-shrink-0";
        switch (type) {
            case 'success':
                return <CheckCircle className={`${iconClass} text-green-400`} />;
            case 'error':
                return <XCircle className={`${iconClass} text-red-400`} />;
            case 'warning':
                return <AlertTriangle className={`${iconClass} text-yellow-400`} />;
            default: // info
                return <Info className={`${iconClass} text-blue-400`} />;
        }
    };

    const handleClose = () => {
        setShow(false);
        setTimeout(() => onClose && onClose(), 300);
    };

    if (!isVisible) return null;

    return (
        <div className={getToastStyles()}>
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                    <p className="text-sm font-medium leading-5">
                        {message}
                    </p>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast; 