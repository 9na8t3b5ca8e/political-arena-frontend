import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);
        
        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Convenience methods
    const showSuccess = (message, duration) => addToast(message, 'success', duration);
    const showError = (message, duration) => addToast(message, 'error', duration);
    const showWarning = (message, duration) => addToast(message, 'warning', duration);
    const showInfo = (message, duration) => addToast(message, 'info', duration);

    const value = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Render all active toasts */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        isVisible={true}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export default NotificationContext; 