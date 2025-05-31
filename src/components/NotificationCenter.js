import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, ExternalLink, Clock, DollarSign, Sword, Shield } from 'lucide-react';
import { apiCall } from '../api';
import { useNotification as useToastNotification } from '../contexts/NotificationContext';

const NotificationCenter = ({ currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { showError: showToastError, showSuccess: showToastSuccess } = useToastNotification();

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // Fetch a limited number of newest notifications
            const params = new URLSearchParams();
            params.append('sort', 'newest');
            params.append('limit', '15'); // Fetch a bit more than display limit for local filtering if needed
            
            const response = await apiCall(`/notifications?${params.toString()}`);
            setNotifications(response.notifications || []);
            setUnreadCount(response.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            showToastError('Failed to load notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await apiCall(`/notifications/${notificationId}/read`, { method: 'PUT' });
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, is_read: true }
                        : notif
                )
            );
            // Optimistically update unread count, server will send authoritative one on next poll
            setUnreadCount(prev => Math.max(0, prev - 1)); 
            // showToastSuccess('Notification marked as read.'); // Optional: can be noisy
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            showToastError('Failed to update notification status.');
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (unreadCount === 0) return; // No action if no unread notifications
        try {
            await apiCall('/notifications/mark-all-read', { method: 'PUT' });
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, is_read: true }))
            );
            setUnreadCount(0);
            showToastSuccess('All notifications marked as read.');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            showToastError('Failed to mark all notifications as read.');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications on mount and periodically
    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    // Get icon for notification type
    const getNotificationIcon = (type) => {
        const iconClass = "w-4 h-4 flex-shrink-0";
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
                        onClick={(e) => {
                            // Allow link navigation, but stop propagation to prevent parent onClick
                            e.stopPropagation(); 
                            // Mark as read is handled by handleNotificationClick or link can also do it
                            // if (!notification.is_read) {
                            // markAsRead(notification.id); // Can be done here if desired
                            // }
                            setIsOpen(false); // Close dropdown on link click
                        }}
                    >
                        {data.user_name}
                    </Link>
                    {parts[1]}
                </>
            );
        }

        return message;
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        // If the notification has a primary link/action, could navigate here too
        // For now, just marking as read. Links inside formatMessage handle navigation.
    };

    // Limit notifications in dropdown to 10 (fetched 15)
    const displayedNotifications = notifications.slice(0, 10);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon with Badge */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h3 className="text-lg font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                Mark All as Read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400">
                                <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
                                <p className="mt-2">Loading notifications...</p>
                            </div>
                        ) : displayedNotifications.length > 0 ? (
                            displayedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
                                        !notification.is_read ? 'bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                {formatMessage(notification)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-gray-500" />
                                                <span className="text-xs text-gray-500">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </span>
                                                {!notification.is_read && (
                                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                <p>No notifications yet</p>
                                <p className="text-sm">We'll notify you when something happens!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 10 && (
                        <div className="p-3 border-t border-gray-700 text-center">
                            <Link
                                to="/notifications"
                                className="text-sm text-blue-400 hover:text-blue-300"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter; 