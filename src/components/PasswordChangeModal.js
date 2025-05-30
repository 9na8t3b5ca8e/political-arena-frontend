// frontend/src/components/PasswordChangeModal.js
import React, { useState } from 'react';
import { apiCall } from '../api';
import { AlertTriangle, Mail } from 'lucide-react'; // Mail icon imported

export default function PasswordChangeModal({ isOpen, onClose, onSuccess, onError, userEmail }) { // userEmail prop added
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [modalError, setModalError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        if (newPassword !== confirmNewPassword) {
            setModalError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setModalError("New password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            const response = await apiCall('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            onSuccess(response.message || "Password changed successfully!");
            setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
        } catch (err) {
            const errorMessage = err.message || "Failed to change password.";
            setModalError(errorMessage);
            if(onError) onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold text-blue-300 mb-4">Account Settings</h2> {/* Title updated */}
                {modalError && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm mb-4 flex items-center"><AlertTriangle size={16} className="mr-2"/>{modalError}</p>}

                {/* Display User Email if available */}
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
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded">
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
