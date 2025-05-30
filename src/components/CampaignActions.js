import React, { useState } from 'react';
import { apiCall } from '../api';

const CampaignActions = ({ onAction, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Calculate dynamic costs for TV Ads and Rally based on current stats
    const tvAdCost = currentUser ? Math.floor(10000 * (1 + (currentUser.state_name_recognition / 50))) : 10000;
    const rallyCost = currentUser ? Math.floor(5000 * (1 + (currentUser.campaign_strength / 40))) : 5000;

    // Check resource requirements for each action
    const canRunTvAd = currentUser && currentUser.action_points >= 20 && currentUser.campaign_funds >= tvAdCost;
    const canOrganizeRally = currentUser && currentUser.action_points >= 15 && currentUser.campaign_funds >= rallyCost;

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

    const getButtonClass = (canDo, baseColor) => {
        const baseClass = "w-full text-left p-3 rounded-lg transition-colors duration-150";
        if (!canDo) {
            return `${baseClass} bg-gray-700/30 cursor-not-allowed opacity-50`;
        }
        return `${baseClass} ${baseColor} hover:${baseColor.replace('/20', '/30')}`;
    };

    if (!currentUser) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-lg mb-3 text-blue-200 border-b border-gray-700 pb-2">Campaign Actions</h3>
                <p className="text-gray-400">Loading user data...</p>
            </div>
        );
    }

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
                    onClick={() => canRunTvAd && handleAction('tv-ad')}
                    disabled={!canRunTvAd || loading}
                    className={getButtonClass(canRunTvAd, 'bg-blue-600/20')}
                >
                    <div className="font-bold text-gray-100">Run TV Ad Campaign</div>
                    <div className="text-sm text-gray-400">
                        +3% State Name Recognition. Costs 20 AP & ${tvAdCost.toLocaleString()}.
                    </div>
                    {!canRunTvAd && (
                        <div className="text-xs text-red-400 mt-1">
                            {currentUser.action_points < 20 && currentUser.campaign_funds < tvAdCost && 
                                `Need 20 AP and $${tvAdCost.toLocaleString()}`}
                            {currentUser.action_points < 20 && currentUser.campaign_funds >= tvAdCost && 
                                `Need 20 AP (you have ${currentUser.action_points})`}
                            {currentUser.action_points >= 20 && currentUser.campaign_funds < tvAdCost && 
                                `Need $${tvAdCost.toLocaleString()} (you have $${currentUser.campaign_funds.toLocaleString()})`}
                        </div>
                    )}
                </button>

                <button
                    onClick={() => canOrganizeRally && handleAction('rally')}
                    disabled={!canOrganizeRally || loading}
                    className={getButtonClass(canOrganizeRally, 'bg-green-600/20')}
                >
                    <div className="font-bold text-gray-100">Organize Campaign Rally</div>
                    <div className="text-sm text-gray-400">
                        +2% Campaign Strength, +1% Approval. Costs 15 AP & ${rallyCost.toLocaleString()}. (70% success)
                    </div>
                    {!canOrganizeRally && (
                        <div className="text-xs text-red-400 mt-1">
                            {currentUser.action_points < 15 && currentUser.campaign_funds < rallyCost && 
                                `Need 15 AP and $${rallyCost.toLocaleString()}`}
                            {currentUser.action_points < 15 && currentUser.campaign_funds >= rallyCost && 
                                `Need 15 AP (you have ${currentUser.action_points})`}
                            {currentUser.action_points >= 15 && currentUser.campaign_funds < rallyCost && 
                                `Need $${rallyCost.toLocaleString()} (you have $${currentUser.campaign_funds.toLocaleString()})`}
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CampaignActions; 