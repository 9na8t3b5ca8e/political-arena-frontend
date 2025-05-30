// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { apiCall } from '../api';
import CampaignActions from '../components/CampaignActions';

// Enhanced MiniProfile component with new economic information
const MiniProfile = ({ user }) => {
    const [incomeDetails, setIncomeDetails] = useState(null);

    useEffect(() => {
        const fetchIncomeDetails = async () => {
            try {
                const details = await apiCall('/income/details');
                setIncomeDetails(details);
            } catch (error) {
                console.error('Error fetching income details:', error);
            }
        };
        fetchIncomeDetails();
    }, []);

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
                    <p className="text-blue-400 font-semibold">{user.approval_rating || 0}%</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Action Points</p>
                    <p className="text-purple-400 font-semibold">{user.action_points || 0}</p>
                    <p className="text-xs text-gray-400">Resets to 50 daily</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Political Capital</p>
                    <p className="text-yellow-400 font-semibold">{user.political_capital || 0}</p>
                    <p className="text-xs text-gray-400">Gain 10 PC daily with "Give Speech"</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">State Name Recognition</p>
                    <p className="text-red-400 font-semibold">{user.state_name_recognition || 0}%</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Campaign Strength</p>
                    <p className="text-orange-400 font-semibold">{user.campaign_strength || 0}%</p>
                </div>
            </div>
        </div>
    );
};

// Enhanced Fundraising component with new system
const Fundraising = ({ onFundraise, user, loadingFundraise, incomeDetails }) => {
    // Calculate progressive costs based on hourly income level
    const calculateProgressiveCost = (baseCost, incomeLevel = 2500) => {
        const multiplier = Math.min(1 + ((incomeLevel / 2500 - 1) * 0.1 * 10), 3.0);
        return Math.floor(baseCost * multiplier);
    };

    const calculateProgressiveIncomeIncrease = (baseIncrease, currentIncome = 2500) => {
        const incomeMultiplier = currentIncome / 2500;
        const scaledIncrease = Math.floor(baseIncrease * (1 + Math.log(incomeMultiplier) * 0.1));
        return Math.max(scaledIncrease, Math.floor(baseIncrease * 0.5));
    };

    const currentHourlyIncome = incomeDetails?.hourly_income || 2500;
    
    // Grassroots Fundraising
    const grassrootsAPCost = calculateProgressiveCost(10, currentHourlyIncome / 2500 * 100);
    const grassrootsFundsCost = calculateProgressiveCost(5000, currentHourlyIncome / 2500 * 100);
    const grassrootsIncomeIncrease = calculateProgressiveIncomeIncrease(250, currentHourlyIncome);
    const canDoGrassroots = user.action_points >= grassrootsAPCost && user.campaign_funds >= grassrootsFundsCost;

    // Large Donor Meeting
    const largeAPCost = calculateProgressiveCost(15, currentHourlyIncome / 2500 * 100);
    const largeFundsCost = calculateProgressiveCost(15000, currentHourlyIncome / 2500 * 100);
    const largeIncomeIncrease = calculateProgressiveIncomeIncrease(750, currentHourlyIncome);
    const canDoLarge = user.action_points >= largeAPCost && user.campaign_funds >= largeFundsCost && user.approval_rating >= 30;

    // PAC Donations
    const pacAPCost = calculateProgressiveCost(20, currentHourlyIncome / 2500 * 100);
    const pacPCCost = calculateProgressiveCost(5, currentHourlyIncome / 2500 * 100);
    const pacIncomeIncrease = calculateProgressiveIncomeIncrease(1500, currentHourlyIncome);
    const canDoPAC = user.action_points >= pacAPCost && user.political_capital >= pacPCCost && user.approval_rating >= 20;

    const getButtonClass = (canDo) => {
        const baseClass = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200";
        return canDo 
            ? `${baseClass} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105`
            : `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Campaign Fundraising</h3>
            <p className="text-sm text-gray-600 mb-4">
                Build your hourly income to fund your political ambitions. Higher income levels increase costs but provide better returns.
            </p>
            
            <div className="space-y-4">
                {/* Grassroots Fundraising */}
                <div className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-green-800">Grassroots Fundraising</h4>
                        <span className="text-xs bg-green-200 px-2 py-1 rounded-full text-green-800">+2 PC, +1 Approval</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Meet with local supporters and community members. Builds political capital and approval.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>💰 Costs: {grassrootsAPCost} AP, ${grassrootsFundsCost.toLocaleString()}</div>
                        <div>📈 Income: +${grassrootsIncomeIncrease.toLocaleString()}/hour</div>
                    </div>
                    <button 
                        onClick={() => onFundraise('grassroots')} 
                        disabled={!canDoGrassroots || loadingFundraise}
                        className={getButtonClass(canDoGrassroots)}
                    >
                        {loadingFundraise ? 'Processing...' : 'Meet with Grassroots Supporters'}
                    </button>
                    {!canDoGrassroots && (
                        <p className="text-xs text-red-600 mt-1">
                            {user.action_points < grassrootsAPCost ? `Need ${grassrootsAPCost} AP` : `Need $${grassrootsFundsCost.toLocaleString()}`}
                        </p>
                    )}
                </div>

                {/* Large Donor Meeting */}
                <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-blue-800">Large Donor Meeting</h4>
                        <span className="text-xs bg-blue-200 px-2 py-1 rounded-full text-blue-800">-2 Approval</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Meet with wealthy individual donors. Higher income but public perception may suffer.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>💰 Costs: {largeAPCost} AP, ${largeFundsCost.toLocaleString()}</div>
                        <div>📈 Income: +${largeIncomeIncrease.toLocaleString()}/hour</div>
                    </div>
                    <button 
                        onClick={() => onFundraise('large_donor')} 
                        disabled={!canDoLarge || loadingFundraise}
                        className={getButtonClass(canDoLarge)}
                    >
                        {loadingFundraise ? 'Processing...' : 'Meet with Large Donors'}
                    </button>
                    {!canDoLarge && (
                        <p className="text-xs text-red-600 mt-1">
                            {user.action_points < largeAPCost ? `Need ${largeAPCost} AP` : 
                             user.campaign_funds < largeFundsCost ? `Need $${largeFundsCost.toLocaleString()}` :
                             'Need 30% approval rating'}
                        </p>
                    )}
                </div>

                {/* PAC Donations */}
                <div className="border rounded-lg p-4 bg-purple-50">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-purple-800">PAC Donation Solicitation</h4>
                        <span className="text-xs bg-purple-200 px-2 py-1 rounded-full text-purple-800">-5 Approval</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        Solicit funds from Political Action Committees. Highest income but significant approval hit.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>💰 Costs: {pacAPCost} AP, {pacPCCost} PC</div>
                        <div>📈 Income: +${pacIncomeIncrease.toLocaleString()}/hour</div>
                    </div>
                    <button 
                        onClick={() => onFundraise('pac')} 
                        disabled={!canDoPAC || loadingFundraise}
                        className={getButtonClass(canDoPAC)}
                    >
                        {loadingFundraise ? 'Processing...' : 'Solicit PAC Donations'}
                    </button>
                    {!canDoPAC && (
                        <p className="text-xs text-red-600 mt-1">
                            {user.action_points < pacAPCost ? `Need ${pacAPCost} AP` : 
                             user.political_capital < pacPCCost ? `Need ${pacPCCost} PC` :
                             'Need 20% approval rating'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Give Speech component
const GiveSpeech = ({ onGiveSpeech, user, loadingGiveSpeech }) => {
    const canGiveSpeech = user.action_points >= 25;
    
    // Check if speech is on cooldown
    const isOnCooldown = user.last_speech_date && 
        (new Date() - new Date(user.last_speech_date)) < (24 * 60 * 60 * 1000);

    const getButtonClass = (canDo) => {
        const baseClass = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200";
        return canDo 
            ? `${baseClass} bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105`
            : `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Political Capital</h3>
            <div className="border rounded-lg p-4 bg-yellow-50">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-yellow-800">Give Speech</h4>
                    <span className="text-xs bg-yellow-200 px-2 py-1 rounded-full text-yellow-800">+10 PC</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                    Deliver a public speech to build your political capital. Can only be done once per day.
                </p>
                <div className="text-xs mb-3">
                    💰 Costs: 25 AP | 📈 Gain: +10 Political Capital
                </div>
                <button 
                    onClick={onGiveSpeech} 
                    disabled={!canGiveSpeech || loadingGiveSpeech || isOnCooldown}
                    className={getButtonClass(canGiveSpeech && !isOnCooldown)}
                >
                    {loadingGiveSpeech ? 'Processing...' : 
                     isOnCooldown ? 'Speech on Cooldown (24h)' : 'Give Speech'}
                </button>
                {!canGiveSpeech && !isOnCooldown && (
                    <p className="text-xs text-red-600 mt-1">Need 25 Action Points</p>
                )}
            </div>
        </div>
    );
};

const HomePage = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingFundraise, setLoadingFundraise] = useState(false);
    const [loadingGiveSpeech, setLoadingGiveSpeech] = useState(false);
    const [incomeDetails, setIncomeDetails] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await apiCall('/auth/profile');
                setCurrentUser(userData);
                
                const incomeData = await apiCall('/income/details');
                setIncomeDetails(incomeData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleFundraise = async (type) => {
        setLoadingFundraise(true);
        try {
            const result = await apiCall('/actions/fundraise', {
                method: 'POST',
                body: JSON.stringify({ type })
            });
            
            // Update user data
            setCurrentUser(prev => ({
                ...prev,
                ...result.newStats
            }));
            
            // Refresh income details
            const incomeData = await apiCall('/income/details');
            setIncomeDetails(incomeData);
            
            alert(result.message);
        } catch (error) {
            alert(error.message || 'Fundraising failed');
        } finally {
            setLoadingFundraise(false);
        }
    };

    const handleGiveSpeech = async () => {
        setLoadingGiveSpeech(true);
        try {
            const result = await apiCall('/actions/give-speech', {
                method: 'POST'
            });
            
            // Update user data
            setCurrentUser(prev => ({
                ...prev,
                ...result.newStats
            }));
            
            alert(result.message);
        } catch (error) {
            alert(error.message || 'Failed to give speech');
        } finally {
            setLoadingGiveSpeech(false);
        }
    };

    const handleAction = async (actionData) => {
        try {
            // Update user data with new stats
            setCurrentUser(prev => ({
                ...prev,
                ...actionData.newStats
            }));
        } catch (error) {
            console.error('Error handling action:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Political Arena Dashboard</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile */}
                    <div>
                        <MiniProfile user={currentUser} />
                    </div>
                    
                    {/* Middle Column - Actions */}
                    <div className="space-y-6">
                        <Fundraising 
                            onFundraise={handleFundraise} 
                            user={currentUser} 
                            loadingFundraise={loadingFundraise}
                            incomeDetails={incomeDetails} 
                        />
                        <GiveSpeech 
                            onGiveSpeech={handleGiveSpeech} 
                            user={currentUser} 
                            loadingGiveSpeech={loadingGiveSpeech} 
                        />
                    </div>
                    
                    {/* Right Column - Campaign Actions */}
                    <div>
                        <CampaignActions onAction={handleAction} currentUser={currentUser} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
