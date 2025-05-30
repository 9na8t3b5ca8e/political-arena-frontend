import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, DollarSign, Sword, Shield, Bell, ExternalLink } from 'lucide-react';
import { apiCall } from '../api';

const NotificationPreview = ({ notification, onClose, onMarkAsRead }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Slide in animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Auto-close after 5 seconds unless hovered
        if (!isHovered) {
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isHovered]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
    };

    const handleClick = () => {
        onMarkAsRead(notification.id);
        handleClose();
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    // Get icon for notification type
    const getNotificationIcon = (type) => {
        const iconClass = "w-5 h-5 flex-shrink-0";
        switch (type) {
            case 'money_received':
                return <DollarSign className={`${iconClass} text-green-400`} />;
            case 'attack_received':
                return <Sword className={`${iconClass} text-red-400`} />;
            case 'support_received':
                return <Shield className={`${iconClass} text-blue-400`} />;
            case 'campaign_action':
                return <ExternalLink className={`${iconClass} text-purple-400`} />;
            default:
                return <Bell className={`${iconClass} text-gray-400`} />;
        }
    };

    // Format notification message with clickable elements
    const formatMessage = (notification) => {
        const { message, data } = notification;
        
        // If there's a user_id in the data, make it clickable
        if (data?.user_id && data?.user_name) {
            const parts = message.split(data.user_name);
            return (
                <>
                    {parts[0]}
                    <Link 
                        to={`/profile/${data.user_id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                        onClick={handleClick}
                    >
                        {data.user_name}
                    </Link>
                    {parts[1]}
                </>
            );
        }

        return message;
    };

    return (
        <div
            className={`fixed bottom-4 right-4 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 transform transition-all duration-300 ease-in-out cursor-pointer ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <span className="text-sm font-medium text-white">New Notification</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Notification content */}
            <div className="p-3">
                <p className="text-sm text-gray-200 leading-relaxed">
                    {formatMessage(notification)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                </p>
            </div>

            {/* Hover instruction */}
            {isHovered && (
                <div className="px-3 pb-2">
                    <p className="text-xs text-blue-400">Click to mark as read and view details</p>
                </div>
            )}
        </div>
    );
};

// NotificationPreviewManager - handles multiple preview notifications
const NotificationPreviewManager = ({ currentUser }) => {
    const [previewNotifications, setPreviewNotifications] = useState([]);
    const [lastNotificationId, setLastNotificationId] = useState(null);

    // Check for new notifications periodically
    useEffect(() => {
        if (!currentUser) return;

        const checkForNewNotifications = async () => {
            try {
                const response = await apiCall('/notifications?limit=1&unread_only=true');
                const latestNotification = response.notifications?.[0];
                
                if (latestNotification && 
                    latestNotification.id !== lastNotificationId && 
                    !latestNotification.is_read) {
                    
                    setLastNotificationId(latestNotification.id);
                    setPreviewNotifications(prev => [
                        ...prev.filter(n => n.id !== latestNotification.id), // Remove duplicates
                        latestNotification
                    ]);
                }
            } catch (error) {
                console.error('Failed to check for new notifications:', error);
            }
        };

        // Initial check
        checkForNewNotifications();
        
        // Check every 10 seconds for new notifications
        const interval = setInterval(checkForNewNotifications, 10000);
        return () => clearInterval(interval);
    }, [currentUser, lastNotificationId]);

    const handleClosePreview = (notificationId) => {
        setPreviewNotifications(prev => 
            prev.filter(n => n.id !== notificationId)
        );
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await apiCall(`/notifications/${notificationId}/read`, { method: 'PUT' });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
            {previewNotifications.map((notification, index) => (
                <div 
                    key={notification.id} 
                    className="pointer-events-auto"
                    style={{
                        transform: `translateY(-${index * 10}px)`,
                        zIndex: 50 - index
                    }}
                >
                    <NotificationPreview
                        notification={notification}
                        onClose={() => handleClosePreview(notification.id)}
                        onMarkAsRead={handleMarkAsRead}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationPreviewManager;
export { NotificationPreview }; 