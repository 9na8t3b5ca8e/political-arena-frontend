import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Bell, Trash2, Check, CheckCircle, Circle, Filter, Search, 
    DollarSign, Sword, Shield, ExternalLink, Clock, ChevronDown,
    Archive, MoreVertical, RefreshCw
} from 'lucide-react';
import { apiCall } from '../api';
import { useNotification } from '../contexts/NotificationContext';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const { showSuccess: showToastSuccess, showError: showToastError } = useNotification();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter === 'unread') params.append('unread_only', 'true');
            if (filter === 'read') params.append('read_only', 'true');
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (searchQuery) params.append('search', searchQuery);
            params.append('sort', sortBy);
            params.append('limit', '100');

            const response = await apiCall(`/notifications?${params.toString()}`);
            setNotifications(response.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            showToastError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [filter, typeFilter, searchQuery, sortBy]);

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
        
        if (data?.user_id && data?.user_name) {
            const parts = message.split(data.user_name);
            return (
                <>
                    {parts[0]}
                    <Link 
                        to={`/profile/${data.user_id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                        {data.user_name}
                    </Link>
                    {parts[1]}
                </>
            );
        }

        return message;
    };

    // Mark notification as read/unread
    const toggleRead = async (notificationId, currentReadStatus) => {
        try {
            const endpoint = currentReadStatus 
                ? `/notifications/${notificationId}/unread` 
                : `/notifications/${notificationId}/read`;
            
            await apiCall(endpoint, { method: 'PUT' });
            
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, is_read: !currentReadStatus }
                        : notif
                )
            );
            
            showToastSuccess(currentReadStatus ? 'Marked as unread' : 'Marked as read');
        } catch (error) {
            showToastError('Failed to update notification');
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            await apiCall(`/notifications/${notificationId}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
            showToastSuccess('Notification deleted');
        } catch (error) {
            showToastError('Failed to delete notification');
        }
    };

    // Bulk actions
    const markAllAsRead = async () => {
        if (!window.confirm('Are you sure you want to mark all notifications as read?')) {
            return;
        }
        try {
            await apiCall('/notifications/mark-all-read', { method: 'PUT' });
            setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
            showToastSuccess('All notifications marked as read');
        } catch (error) {
            showToastError('Failed to mark all as read');
        }
    };

    const markSelectedAsRead = async () => {
        try {
            await apiCall('/notifications/bulk-read', {
                method: 'PUT',
                body: JSON.stringify({ notification_ids: selectedNotifications })
            });
            
            setNotifications(prev =>
                prev.map(notif =>
                    selectedNotifications.includes(notif.id)
                        ? { ...notif, is_read: true }
                        : notif
                )
            );
            
            setSelectedNotifications([]);
            showToastSuccess(`${selectedNotifications.length} notifications marked as read`);
        } catch (error) {
            showToastError('Failed to mark selected as read');
        }
    };

    const deleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedNotifications.length} notifications? This cannot be undone.`)) {
            return;
        }

        try {
            await apiCall('/notifications/bulk-delete', {
                method: 'DELETE',
                body: JSON.stringify({ notification_ids: selectedNotifications })
            });
            
            setNotifications(prev =>
                prev.filter(notif => !selectedNotifications.includes(notif.id))
            );
            
            setSelectedNotifications([]);
            showToastSuccess(`${selectedNotifications.length} notifications deleted`);
        } catch (error) {
            showToastError('Failed to delete selected notifications');
        }
    };

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedNotifications.length === notifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(notifications.map(n => n.id));
        }
    };

    const toggleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-400" />
                        Notifications
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'} • {notifications.length} total
                    </p>
                </div>
                <button
                    onClick={fetchNotifications}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                        >
                            <option value="all">All Notifications</option>
                            <option value="unread">Unread Only</option>
                            <option value="read">Read Only</option>
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="money_received">Money Received</option>
                            <option value="attack_received">Attacks</option>
                            <option value="support_received">Support</option>
                            <option value="campaign_action">Campaign Actions</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Actions */}
                {notifications.length > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded text-blue-500"
                                />
                                <span className="text-sm text-gray-300">
                                    Select All ({selectedNotifications.length} selected)
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                                >
                                    Mark All Read
                                </button>
                            )}
                            
                            {selectedNotifications.length > 0 && (
                                <>
                                    <button
                                        onClick={markSelectedAsRead}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                    >
                                        Mark Selected Read
                                    </button>
                                    <button
                                        onClick={deleteSelected}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                    >
                                        Delete Selected
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-gray-800 border border-gray-700 rounded-lg p-4 transition-colors ${
                                !notification.is_read ? 'bg-blue-900/10 border-blue-700/50' : ''
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Selection Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedNotifications.includes(notification.id)}
                                    onChange={() => toggleSelectNotification(notification.id)}
                                    className="mt-1 rounded text-blue-500"
                                />

                                {/* Notification Icon */}
                                <div className="mt-1">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Notification Content */}
                                <div className="flex-1">
                                    <p className={`text-sm ${!notification.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                        {formatMessage(notification)}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notification.created_at).toLocaleString()}
                                        </div>
                                        {!notification.is_read && (
                                            <span className="flex items-center gap-1 text-xs text-blue-400">
                                                <Circle className="w-2 h-2 fill-current" />
                                                Unread
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleRead(notification.id, notification.is_read)}
                                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                        title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                                    >
                                        {notification.is_read ? <Circle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications found</h3>
                        <p className="text-gray-500">
                            {searchQuery || filter !== 'all' || typeFilter !== 'all'
                                ? 'Try adjusting your filters or search query'
                                : 'We\'ll notify you when something happens!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage; 