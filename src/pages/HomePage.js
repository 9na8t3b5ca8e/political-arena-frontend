// frontend/src/pages/HomePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api';
import { formatPercentage, formatCurrency, formatNumber } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { formatLongDate } from '../utils/dateUtils';

// Create a context for game parameters
const GameParametersContext = React.createContext(null);
export const useGameParameters = () => useContext(GameParametersContext);

// Enhanced MiniProfile component with new economic information
const MiniProfile = ({ user, incomeDetails }) => {
    const gameParameters = useGameParameters();

    if (!user) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
                <div className="h-6 bg-gray-600 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-600 rounded"></div>
                </div>
            </div>
        );
    }

    // Updated AP display logic using gameParameters
    const apSystem = gameParameters?.ap_system;
    const baseApText = apSystem ? `+${apSystem.base_hourly_action_points} per hour (base)` : 'Loading AP info...';
    const officeBonusText = incomeDetails?.ap_bonuses?.office_holder > 0 && apSystem ? 
        <div className="text-green-400">+{apSystem.office_holder_ap_bonus} office bonus</div> : null;
    const leaderBonusText = incomeDetails?.ap_bonuses?.party_leader > 0 && apSystem ?
        <div className="text-blue-400">+{apSystem.party_leader_ap_bonus} leadership bonus</div> : null;
    const totalApText = incomeDetails && apSystem ? 
        <div className="font-medium text-orange-300">Total: +{incomeDetails.hourly_action_points}/hour</div> : null;

    // Updated PC gain hint
    const pcGainText = gameParameters?.actions?.give_speech ? 
        `Gain ${gameParameters.actions.give_speech.pc_gain} PC with "Give Speech"` : 'Loading PC info...';

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-100">{user.first_name} {user.last_name}</h2>
                    <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
                <Link to="/profile" className="text-blue-400 hover:text-blue-300 text-sm">View Full Profile</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-400 text-sm">Party</p>
                    <p className="text-gray-100">{user.party}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Office</p>
                    <p className="text-gray-100">{user.current_office}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Campaign Funds</p>
                    <p className="text-green-400 font-semibold">${user.campaign_funds?.toLocaleString() || 0}</p>
                    {incomeDetails && (
                        <p className="text-xs text-green-300">
                            +${incomeDetails.net_hourly_income?.toLocaleString() || 0}/hour
                            {incomeDetails.hourly_dues > 0 && (
                                <span className="text-yellow-400"> (-${incomeDetails.hourly_dues?.toLocaleString()} dues)</span>
                            )}
                        </p>
                    )}
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Approval Rating</p>
                    <p className="text-blue-400 font-semibold">{user.approval_rating}%</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Action Points</p>
                    <p className="text-orange-400 font-semibold">{user.action_points}</p>
                    <div className="text-xs text-gray-400">
                        <div>{baseApText}</div>
                        {officeBonusText}
                        {leaderBonusText}
                        {totalApText}
                    </div>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Political Capital</p>
                    <p className="text-purple-400 font-semibold">{user.political_capital}</p>
                    <p className="text-xs text-gray-400">{pcGainText}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">State Name Recognition</p>
                    <p className="text-red-400 font-semibold">{formatPercentage(user.state_name_recognition)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Campaign Strength</p>
                    <p className="text-indigo-400 font-semibold">{formatPercentage(user.campaign_strength)}</p>
                </div>
            </div>
        </div>
    );
};

// Enhanced Fundraising component using gameParameters
const Fundraising = ({ onFundraise, user, loadingFundraise, incomeDetails }) => {
    const gameParameters = useGameParameters();
    const fundraisingConfigs = gameParameters?.actions?.fundraising;

    // Progressive cost logic remains for now, using base costs from backend
    // It could be further simplified if backend provided fully calculated costs for the user
    const calculateProgressiveCost = (baseCost, currentIncome = 2500, multiplierConstant) => {
        const incomeRatio = Math.max(1, currentIncome / (gameParameters?.ap_system?.base_hourly_action_points * 500 || 2500)); // base income assumption
        // Using the backend's progressive_cost_multiplier if available, else fallback
        const effectiveMultiplierConstant = multiplierConstant || gameParameters?.limits?.progressive_cost_multiplier || 1.1;
        // Simplified: geometric progression, capped
        // This formula should ideally be identical to any backend calculation if one exists for validation
        // Math.pow(effectiveMultiplierConstant, Math.log10(incomeRatio) * 5); 
        // The frontend was using: Math.min(1 + Math.log(incomeRatio) * 0.5, 3.0);
        // Let's try to stick to a simpler interpretation of progressive_cost_multiplier for now if backend is not calculating it
        // For this iteration, let's use the multiplier more directly if income is higher
        let multiplier = 1;
        if (incomeRatio > 1) {
           multiplier = 1 + (incomeRatio -1) * (effectiveMultiplierConstant -1) ; // Linear interpolation based on multiplier
        }
        multiplier = Math.min(multiplier, gameParameters?.limits?.max_progressive_multiplier || 3.0);
        return Math.max(Math.floor(baseCost * multiplier), baseCost);
    };

    const calculateProgressiveIncomeIncrease = (baseIncrease, currentIncome = 2500, multiplierConstant) => {
        const incomeRatio = Math.max(1, currentIncome / (gameParameters?.ap_system?.base_hourly_action_points * 500 || 2500));
        // const effectiveMultiplierConstant = multiplierConstant || gameParameters?.limits?.progressive_cost_multiplier || 1.1;
        // The frontend was using: Math.floor(baseIncrease * (1 + Math.log(incomeRatio) * 0.2));
        // Let's simplify for now: income increase is less affected by progression, or use a simpler factor.
        let increaseMultiplier = 1 + (incomeRatio - 1) * 0.1; // Smaller progression for gains
        return Math.max(Math.floor(baseIncrease * increaseMultiplier), Math.floor(baseIncrease * 0.5));
    };

    const currentHourlyIncome = incomeDetails?.net_hourly_income || (gameParameters?.ap_system?.base_hourly_action_points * 500 || 2500); // Estimate base if not available

    if (!fundraisingConfigs) {
        return <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"><p>Loading fundraising options...</p></div>;
    }

    const getButtonClass = (canDo) => {
        const baseClass = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200";
        return canDo 
            ? `${baseClass} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105`
            : `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed opacity-60`;
    };

    const getCostMultiplierDisplay = (currentCost, baseCost) => {
        if (baseCost === 0 && currentCost === 0) return "Base Cost"; // Or N/A if preferred for 0 cost
        if (baseCost === 0) return "Cost Varies"; // Case where base is 0 but current might not be (e.g. progressive from 0)
        const multiplier = currentCost / baseCost;
        if (multiplier <= 1.05) return "Base Cost"; // Adjusted threshold slightly
        return `+${Math.round((multiplier - 1) * 100)}% Cost`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Campaign Fundraising</h3>
            <p className="text-sm text-gray-700 mb-4">
                Build your hourly income to fund your political ambitions. Costs may increase as your income grows.
            </p>
            <div className="space-y-4">
                {fundraisingConfigs.map(config => {
                    const baseAPCost = config.base_ap_cost || 0;
                    const baseFundsCost = config.base_funds_cost || 0;
                    const basePCCost = config.base_pc_cost || 0;

                    const currentAPCost = calculateProgressiveCost(baseAPCost, currentHourlyIncome);
                    const currentFundsCost = calculateProgressiveCost(baseFundsCost, currentHourlyIncome);
                    const currentPCCost = calculateProgressiveCost(basePCCost, currentHourlyIncome);
                    const currentIncomeIncrease = calculateProgressiveIncomeIncrease(config.income_increase, currentHourlyIncome);

                    let canDoAction = user.action_points >= currentAPCost;
                    if (config.base_funds_cost) canDoAction = canDoAction && user.campaign_funds >= currentFundsCost;
                    if (config.base_pc_cost) canDoAction = canDoAction && user.political_capital >= currentPCCost;
                    if (config.min_approval_required) canDoAction = canDoAction && user.approval_rating >= config.min_approval_required;
                    
                    let costString = `${currentAPCost} AP`;
                    if (config.base_funds_cost) costString += `, $${currentFundsCost.toLocaleString()}`;
                    if (config.base_pc_cost) costString += `, ${currentPCCost} PC`;

                    let reasons = [];
                    if (user.action_points < currentAPCost) reasons.push(`Need ${currentAPCost} AP`);
                    if (config.base_funds_cost && user.campaign_funds < currentFundsCost) reasons.push(`Need $${currentFundsCost.toLocaleString()}`);
                    if (config.base_pc_cost && user.political_capital < currentPCCost) reasons.push(`Need ${currentPCCost} PC`);
                    if (config.min_approval_required && user.approval_rating < config.min_approval_required) reasons.push(`Need ${config.min_approval_required}% approval`);

                    let bonuses = [];
                    if(config.political_capital_bonus) bonuses.push(`+${config.political_capital_bonus} PC`);
                    if(config.approval_bonus) bonuses.push(`+${config.approval_bonus} Approval`);
                    if(config.approval_penalty) bonuses.push(`${config.approval_penalty} Approval`);
                    if(config.min_approval_required) bonuses.push(`Requires: ${config.min_approval_required}% Approval`);

                    // Determine card color based on type (example)
                    let cardStyle = { borderColor: 'gray-200', bgColor: 'bg-gray-50', titleColor: 'text-gray-800', textColor: 'text-gray-700', accentColor: 'gray-200' };
                    if (config.type === 'grassroots') cardStyle = { borderColor: 'green-200', bgColor: 'bg-green-50', titleColor: 'text-green-800', textColor: 'text-green-700', accentColor: 'green-200' };
                    else if (config.type === 'large_donor') cardStyle = { borderColor: 'blue-200', bgColor: 'bg-blue-50', titleColor: 'text-blue-800', textColor: 'text-blue-700', accentColor: 'blue-200' };
                    else if (config.type === 'pac') cardStyle = { borderColor: 'purple-200', bgColor: 'bg-purple-50', titleColor: 'text-purple-800', textColor: 'text-purple-700', accentColor: 'purple-200' };

                    return (
                        <div key={config.type} className={`border-2 border-${cardStyle.borderColor} rounded-lg p-4 ${cardStyle.bgColor}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-semibold ${cardStyle.titleColor} text-lg`}>{config.name}</h4>
                                <span className={`text-xs bg-${cardStyle.accentColor} px-2 py-1 rounded-full ${cardStyle.titleColor} font-medium`}>
                                    {getCostMultiplierDisplay(currentAPCost, baseAPCost)} 
                                </span>
                            </div>
                            <p className={`text-sm ${cardStyle.textColor} mb-3`}>{config.description || `Details for ${config.name}`}</p>
                            <div className={`grid grid-cols-2 gap-2 text-xs mb-3 ${cardStyle.titleColor}`}>
                                <div className="font-medium">💰 Costs: {costString}</div>
                                <div className="font-medium">📈 Income: +${currentIncomeIncrease.toLocaleString()}/hour</div>
                            </div>
                            {bonuses.length > 0 && (
                                <div className={`text-xs mb-3 ${cardStyle.textColor}`}>
                                    {bonuses.join(' • ')}
                                </div>
                            )}
                            <button 
                                onClick={() => onFundraise(config.type)} 
                                disabled={!canDoAction || loadingFundraise}
                                className={getButtonClass(canDoAction)}
                            >
                                {loadingFundraise ? 'Processing...' : config.name}
                            </button>
                            {!canDoAction && (
                                <p className="text-xs text-red-700 mt-2 font-medium">
                                    {reasons.join(', ')}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// GiveSpeech component using gameParameters
const GiveSpeech = ({ onGiveSpeech, user, loadingGiveSpeech }) => {
    const gameParameters = useGameParameters();
    const speechConfig = gameParameters?.actions?.give_speech;

    if (!speechConfig) {
        return <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"><p>Loading speech action...</p></div>;
    }

    const canGiveSpeech = user.action_points >= speechConfig.base_ap_cost;
    const getButtonClass = (canDo) => {
        const baseClass = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200";
        return canDo 
            ? `${baseClass} bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105`
            : `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed opacity-60`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Public Engagement</h3>
            <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold text-yellow-800 text-lg mb-2">Give a Speech</h4>
                <p className="text-sm text-yellow-700 mb-3">
                    Address the public to boost your political capital. Cooldown applies after each speech.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-yellow-800">
                    <div className="font-medium">💰 Costs: {speechConfig.base_ap_cost} AP</div>
                    <div className="font-medium">📈 Gains: +{speechConfig.pc_gain} PC</div>
                </div>
                <div className="text-xs text-yellow-700 mb-3">Cooldown: {speechConfig.cooldown_hours} hours</div>
                <button 
                    onClick={onGiveSpeech} 
                    disabled={!canGiveSpeech || loadingGiveSpeech}
                    className={getButtonClass(canGiveSpeech)}
                >
                    {loadingGiveSpeech ? 'Delivering...' : 'Give Speech'}
                </button>
                {!canGiveSpeech && (
                    <p className="text-xs text-red-700 mt-1">Need {speechConfig.base_ap_cost} AP</p>
                )}
            </div>
        </div>
    );
};

// CampaignActions component - filtered to only show non-targeted actions
const CampaignActions = ({ onCampaignAction, user, loadingCampaignAction }) => {
    const gameParameters = useGameParameters();
    const campaignActionConfigs = gameParameters?.actions?.campaign;

    // Scaled cost calculation (remains on frontend for now, using backend factor)
    const calculateScaledCost = (baseCost, statValue, scalingFactor) => {
        return Math.floor(baseCost * (1 + scalingFactor * (statValue / 100))); // statValue could be e.g. user.campaign_strength or user.approval_rating
    };

    if (!campaignActionConfigs) {
        return <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"><p>Loading campaign actions...</p></div>;
    }

    // Filter out attack_opponent and support_candidate - these belong on individual profile pages
    const homePageActions = campaignActionConfigs.filter(config => 
        config.type !== 'attack_opponent' && config.type !== 'support_candidate'
    );
    
    const getButtonClass = (canDo) => {
        const baseClass = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200";
        return canDo 
            ? `${baseClass} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105`
            : `${baseClass} bg-gray-400 text-gray-700 cursor-not-allowed opacity-60`;
    };

    const getCostMultiplierDisplay = (currentCost, baseCost) => {
        if (baseCost === 0 && currentCost === 0) return "Base Cost";
        if (baseCost === 0) return "Cost Varies";
        const multiplier = currentCost / baseCost;
        if (multiplier <= 1.05) return "Base Cost";
        return `+${Math.round((multiplier - 1) * 100)}% Cost`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Campaign Operations</h3>
            <div className="space-y-4">
                {homePageActions.map(config => {
                    // Using user's campaign_strength as a generic stat for scaling for this example
                    const relevantStatForScaling = user.campaign_strength || 50; // Default to 50 if not available

                    const currentAPCost = calculateScaledCost(config.base_ap_cost, relevantStatForScaling, config.stat_scaling_factor || 0);
                    const currentFundsCost = calculateScaledCost(config.base_funds_cost, relevantStatForScaling, config.stat_scaling_factor || 0);

                    let canDoAction = user.action_points >= currentAPCost && user.campaign_funds >= currentFundsCost;
                    let reasons = [];
                    if (user.action_points < currentAPCost) reasons.push(`Need ${currentAPCost} AP`);
                    if (user.campaign_funds < currentFundsCost) reasons.push(`Need $${currentFundsCost.toLocaleString()}`);

                    let effectDescription = "Effects vary.";
                    if (config.type === 'tv_advertisement' && config.effects?.snr_increase) {
                        effectDescription = `+${config.effects.snr_increase}% State Name Recognition`;
                    } else if (config.type === 'organize_rally' && config.effects?.cs_increase) {
                        effectDescription = `+${config.effects.cs_increase}% Campaign Strength, +${config.effects.approval_increase}% Approval`;
                    }
                    
                    // Determine card style based on type
                    let cardStyle = { borderColor: 'gray-300', bgColor: 'bg-gray-100', titleColor: 'text-gray-900', textColor: 'text-gray-700', accentColor: 'gray-300' };
                    if(config.type === 'tv_advertisement') cardStyle = { borderColor: 'teal-200', bgColor: 'bg-teal-50', titleColor: 'text-teal-800', textColor: 'text-teal-700', accentColor: 'teal-200' };
                    if(config.type === 'organize_rally') cardStyle = { borderColor: 'orange-200', bgColor: 'bg-orange-50', titleColor: 'text-orange-800', textColor: 'text-orange-700', accentColor: 'orange-200' };

                    return (
                        <div key={config.type} className={`border-2 border-${cardStyle.borderColor} rounded-lg p-4 ${cardStyle.bgColor}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-semibold ${cardStyle.titleColor} text-lg`}>{config.name}</h4>
                                <span className={`text-xs bg-${cardStyle.accentColor} px-2 py-1 rounded-full ${cardStyle.titleColor} font-medium`}>
                                    {getCostMultiplierDisplay(currentAPCost, config.base_ap_cost)}
                                </span>
                            </div>
                            <p className={`text-sm ${cardStyle.textColor} mb-3`}>{config.description}</p>
                            <div className={`grid grid-cols-2 gap-2 text-xs mb-3 ${cardStyle.titleColor}`}>
                                <div className="font-medium">💰 Costs: {currentAPCost} AP, ${currentFundsCost.toLocaleString()}</div>
                                <div className="font-medium">📊 Effect: {effectDescription}</div>
                            </div>

                            <button 
                                onClick={() => onCampaignAction(config.type, {})}
                                disabled={!canDoAction || loadingCampaignAction}
                                className={getButtonClass(canDoAction)}
                            >
                                {loadingCampaignAction ? 'Processing...' : config.name}
                            </button>
                            {!canDoAction && (
                                <p className="text-xs text-red-700 mt-2 font-medium">{reasons.join(', ')}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const HomePage = ({ currentUser: propCurrentUser }) => {
    const { user: authUser, loading: authLoading, updateUser } = useAuth();
    const { addToast, showSuccess, showError } = useNotification();
    const [currentUser, setCurrentUser] = useState(propCurrentUser || authUser);
    const [incomeDetails, setIncomeDetails] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingFundraise, setLoadingFundraise] = useState(false);
    const [loadingGiveSpeech, setLoadingGiveSpeech] = useState(false);
    const [loadingCampaignAction, setLoadingCampaignAction] = useState(false);

    // State for game parameters
    const [gameParameters, setGameParameters] = useState(null);
    const [loadingGameParams, setLoadingGameParams] = useState(true);

    useEffect(() => {
        // Fetch game parameters once on component mount
        const fetchGameParameters = async () => {
            try {
                setLoadingGameParams(true);
                const params = await apiCall('/game/parameters'); // Remove /api/ prefix since it's added by server mounting
                setGameParameters(params);
            } catch (error) {
                console.error("Failed to fetch game parameters:", error);
                showError("Could not load game configuration. Some features might not work correctly.");
                // Set to empty object to prevent crashes, though features will be broken
                setGameParameters({}); 
            } finally {
                setLoadingGameParams(false);
            }
        };
        fetchGameParameters();
    }, [showError]);

    useEffect(() => {
        const resolvedUser = propCurrentUser || authUser;
        if (resolvedUser) {
            setCurrentUser(resolvedUser);
            setLoadingProfile(false); 
        } else if (!authLoading) {
            // If not loading and no user, means not logged in or error during auth
            setLoadingProfile(false);
        }
    }, [propCurrentUser, authUser, authLoading]);

    const fetchIncomeDetails = async () => {
        if (!currentUser || !currentUser.id) return;
        try {
            const details = await apiCall('/income/details'); // Remove user ID from URL as backend expects it from auth token
            setIncomeDetails(details);
        } catch (error) {
            console.error("Failed to fetch income details:", error);
            // showError("Could not load income details.");
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.id) {
            fetchIncomeDetails();
        }
    }, [currentUser, gameParameters]);

    const handleFundraise = async (type) => {
        setLoadingFundraise(true);
        try {
            const response = await apiCall('/actions/fundraise', { 
                method: 'POST', 
                body: JSON.stringify({ type })
            });
            showSuccess(response.message || 'Fundraising action completed!');
            if (response.profile) {
                updateUser(response.profile); // Update user context/state
                setCurrentUser(response.profile); // Update local state
            }
            fetchIncomeDetails(); // Refresh income details after successful fundraising
        } catch (err) {
            console.error('Fundraising error:', err);
            showError(err.message || 'Fundraising failed');
        } finally {
            setLoadingFundraise(false);
        }
    };

    const handleGiveSpeech = async () => {
        setLoadingGiveSpeech(true);
        try {
            const response = await apiCall('/actions/give-speech', { method: 'POST' });
            showSuccess(response.message || 'Speech given successfully!');
            if (response.profile) {
                updateUser(response.profile);
                setCurrentUser(response.profile);
            }
        } catch (err) {
            console.error('Give speech error:', err);
            showError(err.message || 'Failed to give speech');
        } finally {
            setLoadingGiveSpeech(false);
        }
    };

    const handleCampaignAction = async (actionType, params = {}) => {
        setLoadingCampaignAction(true);
        try {
            const body = { action: actionType, ...params };

            const response = await apiCall('/actions/campaign', { 
                method: 'POST', 
                body: JSON.stringify(body)
            });
            showSuccess(response.message || `${actionType.replace('_',' ')} action successful!`);
            if (response.profile) {
                updateUser(response.profile);
                setCurrentUser(response.profile);
            }
        } catch (err) {
            console.error('Campaign action error:', err);
            showError(err.message || `Campaign action ${actionType} failed`);
        } finally {
            setLoadingCampaignAction(false);
        }
    };

    if (loadingGameParams || authLoading || loadingProfile ) {
        return <div className="text-center p-10">Loading game data...</div>;
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
                <h1 className="text-5xl font-bold text-white mb-8">Political Arena</h1>
                <p className="text-xl text-gray-300 mb-12 text-center">
                    Welcome! Please log in or create an account to start your political journey.
                </p>
                <div className="space-x-4">
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
                        Log In
                    </Link>
                    <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
                        Register
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <GameParametersContext.Provider value={gameParameters}>
            <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <MiniProfile user={currentUser} incomeDetails={incomeDetails} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Fundraising onFundraise={handleFundraise} user={currentUser} loadingFundraise={loadingFundraise} incomeDetails={incomeDetails} />
                        <GiveSpeech onGiveSpeech={handleGiveSpeech} user={currentUser} loadingGiveSpeech={loadingGiveSpeech} />
                        <CampaignActions 
                            onCampaignAction={handleCampaignAction} 
                            user={currentUser} 
                            loadingCampaignAction={loadingCampaignAction} 
                        />
                    </div>

                    {/* Election Dashboard with real dates */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Election Dashboard</h2>
                        {gameParameters?.election_cycle ? (
                            <div className="text-sm space-y-2">
                                <p className="text-sm text-gray-300">Current Cycle Start: {formatLongDate(gameParameters.election_cycle.current_cycle_start_date, currentUser)}</p>
                                <p className="text-sm text-gray-300">Filing Period Ends: {formatLongDate(gameParameters.election_cycle.filing_period_ends, currentUser)}</p>
                                <p className="text-sm text-gray-300">Primary Election: {formatLongDate(gameParameters.election_cycle.primary_election_date, currentUser)}</p>
                                <p className="text-sm text-gray-300">General Campaign Starts: {formatLongDate(gameParameters.election_cycle.general_campaign_starts, currentUser)}</p>
                                <p className="text-sm text-gray-300">General Election: {formatLongDate(gameParameters.election_cycle.general_election_date, currentUser)}</p>
                                <p className="text-sm text-gray-300">Current Cycle End: {formatLongDate(gameParameters.election_cycle.current_cycle_end_date, currentUser)}</p>
                            </div>
                        ) : <p>Loading election cycle information...</p>}
                    </div>

                </div>
            </div>
        </GameParametersContext.Provider>
    );
};

export default HomePage;
