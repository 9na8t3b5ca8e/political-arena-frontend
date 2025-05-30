import React, { useState } from 'react';
import { apiCall } from '../api';

const CampaignActions = ({ onAction, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper function to calculate progressive costs
    const calculateProgressiveCost = (baseCost, currentStatValue, maxStat = 100) => {
        const statPercent = Math.min(currentStatValue / maxStat, 1);
        const multiplier = Math.min(1 + (statPercent * 0.1 * 10), 3.0);
        return Math.floor(baseCost * multiplier);
    };

    // Calculate dynamic costs based on current user stats
    const tvAdAPCost = calculateProgressiveCost(15, currentUser?.state_name_recognition || 10);
    const tvAdFundsCost = calculateProgressiveCost(25000, currentUser?.state_name_recognition || 10);
    
    const rallyAPCost = calculateProgressiveCost(12, currentUser?.campaign_strength || 10);
    const rallyFundsCost = calculateProgressiveCost(15000, currentUser?.campaign_strength || 10);

    const attackAPCost = calculateProgressiveCost(20, currentUser?.campaign_strength || 10);
    const attackFundsCost = calculateProgressiveCost(30000, currentUser?.campaign_strength || 10);

    const supportAPCost = calculateProgressiveCost(15, currentUser?.campaign_strength || 10);
    const supportPCCost = calculateProgressiveCost(2, currentUser?.campaign_strength || 10);

    // Check resource requirements for each action
    const canRunTvAd = currentUser && 
        currentUser.action_points >= tvAdAPCost && 
        currentUser.campaign_funds >= tvAdFundsCost;
    
    const canOrganizeRally = currentUser && 
        currentUser.action_points >= rallyAPCost && 
        currentUser.campaign_funds >= rallyFundsCost;

    const canAttack = currentUser && 
        currentUser.action_points >= attackAPCost && 
        currentUser.campaign_funds >= attackFundsCost;

    const canSupport = currentUser && 
        currentUser.action_points >= supportAPCost && 
        currentUser.political_capital >= supportPCCost;

    const getButtonClass = (canDo) => {
        const baseClass = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200";
        return canDo 
            ? `${baseClass} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105`
            : `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    };

    const handleAction = async (actionType, data = {}) => {
        setLoading(true);
        setError('');
        try {
            let endpoint = '';
            let requestData = {};

            switch (actionType) {
                case 'tv_ad':
                    endpoint = '/actions/run-tv-ad';
                    break;
                case 'rally':
                    endpoint = '/actions/organize-rally';
                    break;
                case 'attack':
                    endpoint = '/actions/attack';
                    requestData = { targetUserId: data.targetUserId };
                    break;
                case 'support':
                    endpoint = '/actions/support-candidate';
                    requestData = { targetElectionCandidateId: data.targetElectionCandidateId };
                    break;
                default:
                    throw new Error('Invalid action type');
            }

            const result = await apiCall(endpoint, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            // Call the onAction callback to update parent state
            onAction({ newStats: result.newStats });
            
            alert(result.message);
        } catch (err) {
            setError(err.message || 'Action failed');
            alert(err.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAttack = () => {
        const targetUserId = prompt("Enter the User ID of the player you want to attack:");
        if (targetUserId) {
            handleAction('attack', { targetUserId: parseInt(targetUserId) });
        }
    };

    const handleSupport = () => {
        const targetElectionCandidateId = prompt("Enter the Election Candidate ID you want to support:");
        if (targetElectionCandidateId) {
            handleAction('support', { targetElectionCandidateId: parseInt(targetElectionCandidateId) });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Campaign Actions</h3>
            <p className="text-sm text-gray-600 mb-4">
                Action costs increase as your stats improve. Higher stats = higher costs but maintain effectiveness.
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                {/* TV Advertisement */}
                <div className="border rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-red-800">Run TV Advertisement</h4>
                        <span className="text-xs bg-red-200 px-2 py-1 rounded-full text-red-800">+3% SNR</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Broadcast your message statewide to increase name recognition.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>💰 Costs: {tvAdAPCost} AP, ${tvAdFundsCost.toLocaleString()}</div>
                        <div>📈 Effect: +3% State Name Recognition</div>
                    </div>
                    <button 
                        onClick={() => handleAction('tv_ad')} 
                        disabled={!canRunTvAd || loading}
                        className={getButtonClass(canRunTvAd)}
                    >
                        {loading ? 'Processing...' : 'Run TV Ad Campaign'}
                    </button>
                    {!canRunTvAd && (
                        <p className="text-xs text-red-600 mt-1">
                            {!currentUser ? 'Loading...' :
                             currentUser.action_points < tvAdAPCost ? `Need ${tvAdAPCost} AP` : 
                             `Need $${tvAdFundsCost.toLocaleString()}`}
                        </p>
                    )}
                </div>

                {/* Organize Rally */}
                <div className="border rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-orange-800">Organize Rally</h4>
                        <span className="text-xs bg-orange-200 px-2 py-1 rounded-full text-orange-800">+2% CS, +1% Approval (70% chance)</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Host a public rally to energize supporters and build campaign strength.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>💰 Costs: {rallyAPCost} AP, ${rallyFundsCost.toLocaleString()}</div>
                        <div>📈 Effect: 70% chance for bonuses</div>
                    </div>
                    <button 
                        onClick={() => handleAction('rally')} 
                        disabled={!canOrganizeRally || loading}
                        className={getButtonClass(canOrganizeRally)}
                    >
                        {loading ? 'Processing...' : 'Organize Campaign Rally'}
                    </button>
                    {!canOrganizeRally && (
                        <p className="text-xs text-red-600 mt-1">
                            {!currentUser ? 'Loading...' :
                             currentUser.action_points < rallyAPCost ? `Need ${rallyAPCost} AP` : 
                             `Need $${rallyFundsCost.toLocaleString()}`}
                        </p>
                    )}
                </div>

                {/* Attack Opponent */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">Attack Opponent</h4>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-800">-3% Target Approval (70% chance)</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Launch negative campaign against an active opponent. May backfire.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>💰 Costs: {attackAPCost} AP, ${attackFundsCost.toLocaleString()}</div>
                        <div>⚠️ Risk: May reduce your own approval if it backfires</div>
                    </div>
                    <button 
                        onClick={handleAttack} 
                        disabled={!canAttack || loading}
                        className={getButtonClass(canAttack)}
                    >
                        {loading ? 'Processing...' : 'Launch Attack Campaign'}
                    </button>
                    {!canAttack && (
                        <p className="text-xs text-red-600 mt-1">
                            {!currentUser ? 'Loading...' :
                             currentUser.action_points < attackAPCost ? `Need ${attackAPCost} AP` : 
                             `Need $${attackFundsCost.toLocaleString()}`}
                        </p>
                    )}
                </div>

                {/* Support Candidate */}
                <div className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-green-800">Support Candidate</h4>
                        <span className="text-xs bg-green-200 px-2 py-1 rounded-full text-green-800">+2% Target Approval</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Endorse and support another candidate in an active campaign.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>💰 Costs: {supportAPCost} AP, {supportPCCost} PC</div>
                        <div>📈 Effect: +2% approval for target candidate</div>
                    </div>
                    <button 
                        onClick={handleSupport} 
                        disabled={!canSupport || loading}
                        className={getButtonClass(canSupport)}
                    >
                        {loading ? 'Processing...' : 'Support Candidate'}
                    </button>
                    {!canSupport && (
                        <p className="text-xs text-red-600 mt-1">
                            {!currentUser ? 'Loading...' :
                             currentUser.action_points < supportAPCost ? `Need ${supportAPCost} AP` : 
                             `Need ${supportPCCost} PC`}
                        </p>
                    )}
                </div>
            </div>

            {/* Progressive Cost Information */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">Progressive Cost System</h5>
                <div className="text-xs text-blue-700 space-y-1">
                    <p>• TV Ad costs scale with State Name Recognition ({currentUser?.state_name_recognition || 10}%)</p>
                    <p>• Rally costs scale with Campaign Strength ({currentUser?.campaign_strength || 10}%)</p>
                    <p>• Attack/Support costs scale with Campaign Strength</p>
                    <p>• Higher stats = higher costs but maintain effectiveness</p>
                </div>
            </div>
        </div>
    );
};

export default CampaignActions; 