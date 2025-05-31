import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { AlertTriangle, Mail, Clock, Check } from 'lucide-react';

const TIMEZONE_OPTIONS = [
    'Auto-detect',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu',
    'America/Phoenix', 'America/Detroit', 'America/Indianapolis', 'America/Louisville', 'America/Kentucky/Monticello',
    'America/Juneau', 'America/Metlakatla', 'America/Sitka', 'America/Yakutat', 'America/Nome', 'America/Adak',
    'America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 'America/Halifax',
    'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam',
    'Europe/Vienna', 'Europe/Prague', 'Europe/Stockholm', 'Europe/Warsaw', 'Europe/Budapest', 'Europe/Bucharest',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Seoul', 'Asia/Kolkata',
    'Asia/Dubai', 'Asia/Bangkok', 'Asia/Manila', 'Asia/Jakarta', 'Asia/Kuala_Lumpur', 'Asia/Tel_Aviv',
    'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide',
    'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Tahiti', 'Pacific/Guam', 'Pacific/Samoa'
];

export default function SettingsModal({ isOpen, onClose, onSuccess, onError, userEmail, currentUser, setCurrentUser }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [timezone, setTimezone] = useState('Auto-detect');
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('account');

    useEffect(() => {
        if (isOpen) {
            // Load timezone: prioritize from user object, then localStorage, then default
            const userTimezone = currentUser?.preferences?.timezone;
            const savedTimezone = localStorage.getItem('userTimezone');
            setTimezone(userTimezone || savedTimezone || 'Auto-detect');
            
            // Reset states
            setModalError('');
            setModalSuccess('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            if (activeTab !== 'account') setActiveTab('account'); // Default to account tab
        }
    }, [isOpen, currentUser]); // Add currentUser dependency

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalSuccess('');
        
        if (newPassword !== confirmNewPassword) {
            const errMsg = "New passwords do not match.";
            setModalError(errMsg);
            if (onError) onError(errMsg);
            return;
        }
        if (newPassword.length < 6) {
            const errMsg = "New password must be at least 6 characters long.";
            setModalError(errMsg);
            if (onError) onError(errMsg);
            return;
        }

        setLoading(true);
        try {
            const response = await apiCall('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const successMsg = response.message || "Password changed successfully!";
            setModalSuccess(successMsg);
            if (onSuccess) onSuccess(successMsg);
            setCurrentPassword(''); 
            setNewPassword(''); 
            setConfirmNewPassword('');
        } catch (err) {
            const errorMessage = err.message || "Failed to change password.";
            setModalError(errorMessage);
            if (onError) onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleTimezoneSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalSuccess('');
        setLoading(true);

        try {
            // Save timezone preference to backend
            await apiCall('/user/preferences/timezone', { // Assuming endpoint like this
                method: 'PUT', // Or POST, depending on backend API design
                body: JSON.stringify({ timezone }),
            });
            
            // Update localStorage as a fallback or for immediate local reflection
            localStorage.setItem('userTimezone', timezone);
            
            // Update AuthContext/currentUser state
            if (currentUser && setCurrentUser) {
                setCurrentUser({
                    ...currentUser,
                    preferences: {
                        ...currentUser.preferences,
                        timezone: timezone,
                    },
                });
            }
            const successMsg = "Timezone preference saved successfully!";
            setModalSuccess(successMsg);
            if (onSuccess) onSuccess(successMsg);

        } catch (err) {
            const errorMessage = err.message || "Failed to save timezone preference.";
            setModalError(errorMessage);
            if (onError) onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getTimezoneLabel = (tz) => {
        if (tz === 'Auto-detect') return 'Auto-detect (Browser)';
        
        const labelMap = {
            'America/New_York': 'Eastern Time (New York)',
            'America/Chicago': 'Central Time (Chicago)',
            'America/Denver': 'Mountain Time (Denver)',
            'America/Los_Angeles': 'Pacific Time (Los Angeles)',
            'America/Anchorage': 'Alaska Time (Anchorage)',
            'Pacific/Honolulu': 'Hawaii Time (Honolulu)',
            'America/Phoenix': 'Arizona Time (Phoenix)',
            'Europe/London': 'GMT (London)',
            'Europe/Berlin': 'CET (Berlin)',
            'Asia/Tokyo': 'JST (Tokyo)',
            'Asia/Shanghai': 'CST (Shanghai)',
            'Australia/Sydney': 'AEDT (Sydney)',
        };
        
        return labelMap[tz] || tz.replace(/_/g, ' ').replace('/', ' / ');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-blue-300 mb-4">Account Settings</h2>
                
                {modalError && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm mb-4 flex items-center"><AlertTriangle size={16} className="mr-2"/>{modalError}</p>}
                {modalSuccess && <p className="bg-green-500/20 text-green-300 p-3 rounded text-sm mb-4 flex items-center"><Check size={16} className="mr-2"/>{modalSuccess}</p>}

                {/* Tab Navigation */}
                <div className="flex mb-6 border-b border-gray-700">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'account' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'preferences' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        Preferences
                    </button>
                </div>

                {activeTab === 'account' && (
                    <>
                        {/* Display User Email */}
                        {userEmail && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Your Email</label>
                                <div className="flex items-center p-2 bg-gray-700/50 rounded border border-gray-600">
                                    <Mail size={16} className="mr-2 text-gray-400" />
                                    <span className="text-sm text-gray-200">{userEmail}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This email is not shown on your public profile.</p>
                            </div>
                        )}

                        {/* Separator */}
                        {userEmail && <hr className="border-gray-700 my-4" />}

                        <h3 className="text-lg font-semibold text-blue-300 mb-3">Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded">
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {activeTab === 'preferences' && (
                    <>
                        <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                            <Clock size={18} className="mr-2" />
                            Timezone Settings
                        </h3>
                        <form onSubmit={handleTimezoneSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Timezone</label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {TIMEZONE_OPTIONS.map(tz => (
                                        <option key={tz} value={tz}>
                                            {getTimezoneLabel(tz)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    All times throughout the site will be displayed in your selected timezone.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded">
                                    {loading && activeTab === 'preferences' ? 'Saving...' : 'Save Timezone'}
                                </button>
                            </div>
                        </form>

                        {/* Current time preview */}
                        <div className="mt-6 p-3 bg-gray-700/50 rounded border border-gray-600">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
                            <p className="text-sm text-gray-200">
                                Current time: {new Date().toLocaleString(undefined, {
                                    timeZone: timezone === 'Auto-detect' ? undefined : timezone,
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    timeZoneName: 'short'
                                })}
                            </p>
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={loading} 
                        className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
} 