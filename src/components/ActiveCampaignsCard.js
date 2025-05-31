import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const ActiveCampaignsCard = ({ userId, isOwnProfile }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showError: showToastError } = useNotification();

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                setError('');
                const endpoint = isOwnProfile ? '/profile/my-candidacies' : `/profiles/${userId}/active-candidacies`;
                const data = await apiCall(endpoint);
                setCampaigns(data);
            } catch (err) {
                const errorMessage = 'Failed to load campaign information. Please try refreshing.';
                setError(errorMessage);
                showToastError(err.message || errorMessage);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [userId, isOwnProfile, showToastError]);

    if (loading) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-3 text-blue-200">Active Campaigns & Finance</h3>
                <p className="text-gray-400">Loading campaign information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-3 text-blue-200">Active Campaigns & Finance</h3>
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-3 text-blue-200">Active Campaigns & Finance</h3>
                <p className="text-gray-400">No active campaigns at this time.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-3 text-blue-200">Active Campaigns & Finance</h3>
            <div className="space-y-4">
                {campaigns.map(campaign => (
                    <div key={campaign.election_candidate_id} className="bg-gray-700/50 p-3 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                            <Link
                                to={`/state/${encodeURIComponent(campaign.state)}`}
                                className="text-lg font-medium text-gray-100 hover:text-blue-300"
                            >
                                {campaign.office}, {campaign.state}
                            </Link>
                            <span className="text-sm text-gray-400">{campaign.election_year}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-green-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Current Funds</p>
                                    <p className="text-gray-100">${(campaign.current_funds || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-blue-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Total Raised</p>
                                    <p className="text-gray-100">${(campaign.total_raised || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingDown size={16} className="text-red-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Total Spent</p>
                                    <p className="text-gray-100">${(campaign.total_spent || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={16} className="text-yellow-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Status</p>
                                    <p className="text-gray-100">{campaign.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveCampaignsCard; 