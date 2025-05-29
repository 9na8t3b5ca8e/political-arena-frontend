import React, { useState } from 'react';
import { apiCall } from '../api';

const CampaignActions = ({ onAction }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAction = async (actionType) => {
        try {
            setLoading(true);
            setError('');
            const endpoint = actionType === 'tv-ad' ? '/actions/run-tv-ad' : '/actions/organize-rally';
            const res = await apiCall(endpoint, { method: 'POST' });
            onAction(res.newStats);
            alert(res.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-3 text-blue-200 border-b border-gray-700 pb-2">Campaign Actions</h3>
            {error && (
                <div className="bg-red-500/20 text-red-400 p-2 rounded mb-3 text-sm" onClick={() => setError('')}>
                    {error}
                </div>
            )}
            <div className="space-y-2">
                <button
                    onClick={() => handleAction('tv-ad')}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors duration-150 disabled:opacity-50"
                >
                    <div className="font-bold text-gray-100">Run TV Ad Campaign</div>
                    <div className="text-sm text-gray-400">
                        Increase State Name Recognition in your home state. Cost varies with current SNR.
                    </div>
                </button>

                <button
                    onClick={() => handleAction('rally')}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors duration-150 disabled:opacity-50"
                >
                    <div className="font-bold text-gray-100">Organize Campaign Rally</div>
                    <div className="text-sm text-gray-400">
                        Boost Campaign Strength and potentially Approval Rating. 70% success rate.
                    </div>
                </button>
            </div>
        </div>
    );
};

export default CampaignActions; 