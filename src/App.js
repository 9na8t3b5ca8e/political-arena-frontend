import React, { useState, useEffect } from 'react';
import { Users, Vote, DollarSign, TrendingUp, Trophy, Map, User, Globe, Clock, Star, AlertCircle, Edit, Eye, Timer } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'https://political-arena-backend.onrender.com/api';

// API Helper Functions
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

function PoliticalGame() {
  const [gameState, setGameState] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [activeElections, setActiveElections] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: ''
  });

  // Check for existing auth token on load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUserProfile();
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (gameState === 'lobby') {
      const interval = setInterval(() => {
        loadGameData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Load user profile from API
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await apiCall('/auth/profile');
      setCurrentUser({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        profile: {
          firstName: profile.first_name,
          lastName: profile.last_name,
          party: profile.party,
          economicStance: profile.economic_stance || 4,
          socialStance: profile.social_stance || 4,
          homeState: profile.home_state,
          bio: profile.bio,
          currentOffice: profile.current_office,
          politicalCapital: profile.political_capital,
          approval: profile.approval_rating,
          campaignFunds: profile.campaign_funds,
          gender: profile.gender,
          race: profile.race,
          religion: profile.religion,
          age: profile.age
        }
      });
      
      if (profile.party && profile.home_state) {
        setGameState('lobby');
        loadGameData();
      } else {
        setGameState('profile');
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      localStorage.removeItem('authToken');
      setGameState('login');
    } finally {
      setLoading(false);
    }
  };

  // Load game data
  const loadGameData = async () => {
    try {
      const [elections, players] = await Promise.all([
        apiCall('/elections'),
        apiCall('/players/online')
      ]);
      
      setActiveElections(elections);
      setAllPlayers(players.map(p => ({
        id: p.id,
        username: p.username,
        profile: {
          firstName: p.first_name,
          lastName: p.last_name,
          party: p.party,
          homeState: p.home_state,
          currentOffice: p.current_office,
          approval: p.approval_rating,
          campaignFunds: p.campaign_funds,
          politicalCapital: p.political_capital
        }
      })));
    } catch (error) {
      console.error('Game data loading error:', error);
      setError('Failed to load game data');
    }
  };

  // Utility functions
  const formatTimeRemaining = (hours) => {
    if (hours < 0) return 'Ended';
    if (hours < 1) return `${Math.floor(hours * 60)}m`;
    if (hours < 24) return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const getElectionStatus = (election) => {
    const now = Date.now();
    const filingDeadline = new Date(election.filing_deadline).getTime();
    const campaignStart = new Date(election.campaign_start).getTime();
    const electionDate = new Date(election.election_date).getTime();
    
    if (now < filingDeadline) return 'Filing Open';
    if (now < campaignStart) return 'Filing Closed';  
    if (now < electionDate) return 'Campaign Active';
    if (now < electionDate + (24 * 60 * 60 * 1000)) return 'Voting Open';
    return 'Completed';
  };

  const getNextDeadline = (election) => {
    const now = Date.now();
    const filingDeadline = new Date(election.filing_deadline).getTime();
    const campaignStart = new Date(election.campaign_start).getTime();
    const electionDate = new Date(election.election_date).getTime();
    
    if (now < filingDeadline) return { type: 'Filing ends', time: filingDeadline };
    if (now < campaignStart) return { type: 'Campaign starts', time: campaignStart };
    if (now < electionDate) return { type: 'Election day', time: electionDate };
    return { type: 'Voting ends', time: electionDate + (24 * 60 * 60 * 1000) };
  };

  // Demographic options
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const raceOptions = ['White', 'Black', 'Hispanic', 'Asian', 'Native American', 'Pacific Islander', 'Mixed', 'Other', 'Prefer not to say'];
  const religionOptions = ['Christian', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Atheist', 'Agnostic', 'Other', 'Prefer not to say'];

  // Political stance mapping
  const stanceScale = [
    { value: 1, label: 'Far Left', color: 'bg-blue-800' },
    { value: 2, label: 'Left', color: 'bg-blue-600' },
    { value: 3, label: 'Center-Left', color: 'bg-blue-400' },
    { value: 4, label: 'Moderate', color: 'bg-purple-500' },
    { value: 5, label: 'Center-Right', color: 'bg-red-400' },
    { value: 6, label: 'Right', color: 'bg-red-600' },
    { value: 7, label: 'Far Right', color: 'bg-red-800' }
  ];

  // State data
  const stateData = {
    'Alabama': { economic: 6, social: 6, region: 'South', population: 5030053 },
    'Alaska': { economic: 5, social: 5, region: 'West', population: 732673 },
    'Arizona': { economic: 5, social: 4, region: 'Southwest', population: 7359197 },
    'Arkansas': { economic: 6, social: 6, region: 'South', population: 3025891 },
    'California': { economic: 2, social: 2, region: 'West', population: 39237836 },
    'Colorado': { economic: 3, social: 3, region: 'West', population: 5812069 },
    'Connecticut': { economic: 3, social: 2, region: 'Northeast', population: 3605944 },
    'Delaware': { economic: 3, social: 3, region: 'Northeast', population: 1003384 },
    'Florida': { economic: 5, social: 5, region: 'South', population: 22610726 },
    'Georgia': { economic: 4, social: 5, region: 'South', population: 10912876 },
    'Hawaii': { economic: 2, social: 2, region: 'West', population: 1440196 },
    'Idaho': { economic: 6, social: 6, region: 'West', population: 1939033 },
    'Illinois': { economic: 3, social: 3, region: 'Midwest', population: 12587530 },
    'Indiana': { economic: 5, social: 5, region: 'Midwest', population: 6862199 },
    'Iowa': { economic: 4, social: 4, region: 'Midwest', population: 3207004 },
    'Kansas': { economic: 5, social: 5, region: 'Midwest', population: 2937150 },
    'Kentucky': { economic: 5, social: 6, region: 'South', population: 4540719 },
    'Louisiana': { economic: 5, social: 6, region: 'South', population: 4590241 },
    'Maine': { economic: 3, social: 3, region: 'Northeast', population: 1395722 },
    'Maryland': { economic: 3, social: 2, region: 'Northeast', population: 6164660 },
    'Massachusetts': { economic: 2, social: 2, region: 'Northeast', population: 7001399 },
    'Michigan': { economic: 4, social: 4, region: 'Midwest', population: 10037261 },
    'Minnesota': { economic: 3, social: 3, region: 'Midwest', population: 5785683 },
    'Mississippi': { economic: 6, social: 6, region: 'South', population: 2940057 },
    'Missouri': { economic: 5, social: 5, region: 'Midwest', population: 6196656 },
    'Montana': { economic: 5, social: 5, region: 'West', population: 1122069 },
    'Nebraska': { economic: 5, social: 5, region: 'Midwest', population: 1987100 },
    'Nevada': { economic: 4, social: 3, region: 'West', population: 3194176 },
    'New Hampshire': { economic: 4, social: 3, region: 'Northeast', population: 1402054 },
    'New Jersey': { economic: 3, social: 3, region: 'Northeast', population: 9290841 },
    'New Mexico': { economic: 3, social: 3, region: 'Southwest', population: 2114371 },
    'New York': { economic: 2, social: 2, region: 'Northeast', population: 19469232 },
    'North Carolina': { economic: 4, social: 5, region: 'South', population: 10835491 },
    'North Dakota': { economic: 5, social: 5, region: 'Midwest', population: 783926 },
    'Ohio': { economic: 4, social: 4, region: 'Midwest', population: 11812062 },
    'Oklahoma': { economic: 6, social: 6, region: 'South', population: 4019800 },
    'Oregon': { economic: 2, social: 2, region: 'West', population: 4233358 },
    'Pennsylvania': { economic: 4, social: 4, region: 'Northeast', population: 13011844 },
    'Rhode Island': { economic: 3, social: 2, region: 'Northeast', population: 1095610 },
    'South Carolina': { economic: 5, social: 6, region: 'South', population: 5373555 },
    'South Dakota': { economic: 5, social: 5, region: 'Midwest', population: 919318 },
    'Tennessee': { economic: 5, social: 6, region: 'South', population: 7126489 },
    'Texas': { economic: 5, social: 5, region: 'South', population: 30029572 },
    'Utah': { economic: 5, social: 5, region: 'West', population: 3380800 },
    'Vermont': { economic: 2, social: 2, region: 'Northeast', population: 647064 },
    'Virginia': { economic: 4, social: 4, region: 'South', population: 8715698 },
    'Washington': { economic: 2, social: 2, region: 'West', population: 7812880 },
    'West Virginia': { economic: 5, social: 6, region: 'South', population: 1775156 },
    'Wisconsin': { economic: 4, social: 4, region: 'Midwest', population: 5892539 },
    'Wyoming': { economic: 6, social: 6, region: 'West', population: 584057 }
  };

  const parties = [
    { name: 'Democrat', color: 'bg-blue-600', abbreviation: 'D' },
    { name: 'Republican', color: 'bg-red-600', abbreviation: 'R' },
    { name: 'Independent', color: 'bg-purple-600', abbreviation: 'I' }
  ];

  // Authentication functions
  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError('Please enter username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      });

      localStorage.setItem('authToken', response.token);
      await loadUserProfile();
      
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          firstName: registerForm.firstName,
          lastName: registerForm.lastName
        })
      });

      localStorage.setItem('authToken', response.token);
      await loadUserProfile();
      
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (field, value) => {
    setCurrentUser(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));

    try {
      const updateData = {};
      updateData[field] = value;
      
      await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
    } catch (error) {
      console.error('Profile update error:', error);
      await loadUserProfile();
    }
  };

  const enterLobby = async () => {
    if (currentUser.profile.party && currentUser.profile.homeState) {
      setGameState('lobby');
      await loadGameData();
    }
  };

  const performFundraisingAction = async (actionType) => {
    try {
      setLoading(true);
      
      const response = await apiCall('/fundraising/action', {
        method: 'POST',
        body: JSON.stringify({ actionType })
      });

      setCurrentUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          campaignFunds: prev.profile.campaignFunds + response.fundsGained,
          approval: Math.max(0, Math.min(100, prev.profile.approval + response.approvalChange)),
          politicalCapital: Math.max(0, prev.profile.politicalCapital + response.politicalCapitalChange)
        }
      }));
      
      setError('');
    } catch (error) {
      setError(error.message || 'Fundraising action failed');
    } finally {
      setLoading(false);
    }
  };

  const fileForElection = async (election) => {
    try {
      setLoading(true);
      
      await apiCall(`/elections/${election.id}/file`, {
        method: 'POST'
      });

      await loadGameData();
      
      setCurrentUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          campaignFunds: prev.profile.campaignFunds - election.filing_fee
        }
      }));
      
      setError('');
    } catch (error) {
      setError(error.message || 'Filing for election failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setGameState('login');
    setError('');
  };

  const getStanceLabel = (value) => {
    return stanceScale.find(s => s.value === value)?.label || 'Moderate';
  };

  const getStanceColor = (value) => {
    return stanceScale.find(s => s.value === value)?.color || 'bg-purple-500';
  };

  const calculateStateAlignment = (playerEconomic, playerSocial, state) => {
    const stateEconomic = stateData[state]?.economic || 4;
    const stateSocial = stateData[state]?.social || 4;
    const economicDiff = Math.abs(playerEconomic - stateEconomic);
    const socialDiff = Math.abs(playerSocial - stateSocial);
    return Math.max(0, 100 - ((economicDiff + socialDiff) * 8));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🇺🇸 Political Arena</h1>
              <p className="text-white/80">Multiplayer Political Simulation • Live Elections</p>
            </div>
            <div className="flex space-x-4 text-white">
              {currentUser && (
                <>
                  <div className="text-center">
                    <User className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm">{currentUser.username}</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm">{allPlayers.length} Online</div>
                  </div>
                  <div className="text-center">
                    <Vote className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm">{activeElections.length} Elections</div>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-all"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-400 rounded-xl p-4 mb-6">
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-6 border border-white/20 text-center">
            <div className="text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        )}

        {/* Login Screen */}
        {gameState === 'login' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Login to Political Arena</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button
                onClick={() => setGameState('register')}
                className="w-full bg-transparent border border-white/30 text-white p-3 rounded-lg font-bold hover:bg-white/10 transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Registration Screen */}
        {gameState === 'register' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
                />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={registerForm.username}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
              />
              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
              />
              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
              />
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-lg font-bold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <button
                onClick={() => setGameState('login')}
                className="w-full bg-transparent border border-white/30 text-white p-3 rounded-lg font-bold hover:bg-white/10 transition-all"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Profile Setup */}
        {gameState === 'profile' && currentUser && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Setup Your Political Profile</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Home State</label>
                  <select
                    value={currentUser.profile.homeState || ''}
                    onChange={(e) => updateProfile('homeState', e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30"
                  >
                    <option value="">Select State</option>
                    {Object.keys(stateData).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {currentUser.profile.homeState && (
                    <div className="mt-2 text-white/80 text-sm">
                      Population: {stateData[currentUser.profile.homeState].population.toLocaleString()} • 
                      Region: {stateData[currentUser.profile.homeState].region}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-white mb-2">Political Party</label>
                  <div className="grid grid-cols-3 gap-2">
                    {parties.map((party) => (
                      <button
                        key={party.name}
                        onClick={() => updateProfile('party', party.name)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          currentUser.profile.party === party.name
                            ? `${party.color} border-white text-white`
                            : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                        }`}
                      >
                        <div className="font-bold">{party.abbreviation}</div>
                        <div className="text-xs">{party.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Political Stances */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Political Positions</h3>
                
                <div>
                  <label className="block text-white mb-2">
                    Economic Policy: {getStanceLabel(currentUser.profile.economicStance)}
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-white/80 text-sm">Far Left</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={currentUser.profile.economicStance}
                      onChange={(e) => updateProfile('economicStance', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white/80 text-sm">Far Right</span>
                  </div>
                  <div className={`mt-2 p-2 rounded text-white text-center ${getStanceColor(currentUser.profile.economicStance)}`}>
                    {getStanceLabel(currentUser.profile.economicStance)}
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Social Policy: {getStanceLabel(currentUser.profile.socialStance)}
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-white/80 text-sm">Far Left</span>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={currentUser.profile.socialStance}
                      onChange={(e) => updateProfile('socialStance', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white/80 text-sm">Far Right</span>
                  </div>
                  <div className={`mt-2 p-2 rounded text-white text-center ${getStanceColor(currentUser.profile.socialStance)}`}>
                    {getStanceLabel(currentUser.profile.socialStance)}
                  </div>
                </div>

                {/* State Alignment */}
                {currentUser.profile.homeState && (
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">State Alignment Analysis</h4>
                    <div className="text-white/80 text-sm mb-2">
                      Your positions vs. {currentUser.profile.homeState} voters:
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-white text-sm">Economic Match:</div>
                        <div className="text-white font-bold">
                          {Math.max(0, 100 - Math.abs(currentUser.profile.economicStance - stateData[currentUser.profile.homeState].economic) * 15)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-white text-sm">Social Match:</div>
                        <div className="text-white font-bold">
                          {Math.max(0, 100 - Math.abs(currentUser.profile.socialStance - stateData[currentUser.profile.homeState].social) * 15)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-white text-sm">Overall Alignment:</div>
                      <div className="text-white font-bold text-lg">
                        {calculateStateAlignment(currentUser.profile.economicStance, currentUser.profile.socialStance, currentUser.profile.homeState)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-white mb-2">Political Bio</label>
                <textarea
                  value={currentUser.profile.bio || ''}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  placeholder="Tell voters about your background and political goals..."
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 h-24"
                />
              </div>

              <button
                onClick={enterLobby}
                disabled={!currentUser.profile.party || !currentUser.profile.homeState}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-blue-700 transition-all"
              >
                Enter Political Arena
              </button>
            </div>
          </div>
        )}

        {/* Lobby/Dashboard */}
        {gameState === 'lobby' && currentUser && (
          <div className="space-y-6">
            {/* Enhanced Player Stats with Edit Button */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Your Profile</h3>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold transition-all flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center text-white">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{currentUser.profile.approval}%</div>
                  <div className="text-sm opacity-80">Approval</div>
                </div>
                <div className="text-center text-white">
                  <DollarSign className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-2xl font-bold">${currentUser.profile.campaignFunds?.toLocaleString() || '0'}</div>
                  <div className="text-sm opacity-80">Campaign Funds</div>
                </div>
                <div className="text-center text-white">
                  <Trophy className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{currentUser.profile.politicalCapital}</div>
                  <div className="text-sm opacity-80">Political Capital</div>
                </div>
                <div className="text-center text-white">
                  <Map className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-lg font-bold">{currentUser.profile.currentOffice}</div>
                  <div className="text-sm opacity-80">Current Office</div>
                </div>
                <div className="text-center text-white">
                  <Globe className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-lg font-bold">{currentUser.profile.homeState}</div>
                  <div className="text-sm opacity-80">Home State</div>
                </div>
              </div>
            </div>

            {/* Active Elections with Enhanced Timing */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Active Elections ({activeElections.length})</h3>
              <div className="grid gap-4">
                {activeElections.map((election) => {
                  const userIsCandidate = election.candidates?.some(c => c.user_id === currentUser.id);
                  const canFile = election.status === 'accepting_candidates' && 
                                 !userIsCandidate && 
                                 currentUser.profile.campaignFunds >= election.filing_fee &&
                                 election.state === currentUser.profile.homeState;
                  
                  const nextDeadline = getNextDeadline(election);
                  const timeRemaining = (nextDeadline.time - Date.now()) / (1000 * 60 * 60);
                  
                  return (
                    <div key={election.id} className="bg-white/10 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-bold text-lg">{election.office}</h4>
                          <p className="text-white/70">{election.state} • Filing Fee: ${election.filing_fee?.toLocaleString()}</p>
                          
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center">
                              <Timer className="w-4 h-4 text-white/60 mr-2" />
                              <span className="text-white/80 text-sm">
                                {nextDeadline.type}: {formatTimeRemaining(timeRemaining)}
                              </span>
                            </div>
                            <div className="text-white/60 text-xs">
                              {election.candidate_count || 0} candidates
                            </div>
                          </div>
                          
                          {election.state !== currentUser.profile.homeState && (
                            <div className="mt-2 text-yellow-400 text-xs flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Only {election.state} residents can file
                            </div>
                          )}
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          getElectionStatus(election) === 'Filing Open' ? 'bg-yellow-600 text-white' :
                          getElectionStatus(election) === 'Campaign Active' ? 'bg-blue-600 text-white' :
                          getElectionStatus(election) === 'Voting Open' ? 'bg-green-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {getElectionStatus(election)}
                        </div>
                      </div>
                      
                      {election.candidates && election.candidates.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-white font-bold mb-2">Candidates ({election.candidates.length})</h5>
                          <div className="grid gap-2">
                            {election.candidates.map((candidate, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white/10 p-3 rounded">
                                <div className="flex items-center">
                                  <span className="text-white font-bold">
                                    {candidate.first_name} {candidate.last_name} {candidate.user_id === currentUser.id && '(You)'}
                                  </span>
                                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    parties.find(p => p.name === candidate.party)?.color || 'bg-gray-500'
                                  } text-white`}>
                                    {parties.find(p => p.name === candidate.party)?.abbreviation || 'I'}
                                  </span>
                                </div>
                                <div className="text-white text-sm">
                                  {election.status === 'voting_open' && candidate.total_votes 
                                    ? `${candidate.total_votes.toLocaleString()} votes`
                                    : `${candidate.approval_at_filing || 0}% approval`
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        {canFile && (
                          <button
                            onClick={() => fileForElection(election)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            File for ${election.filing_fee?.toLocaleString()}
                          </button>
                        )}
                        
                        {election.state !== currentUser.profile.homeState && (
                          <div className="text-yellow-400 text-sm py-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Must be {election.state} resident to file
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {activeElections.length === 0 && (
                  <div className="text-center text-white/60 py-8">
                    <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active elections at the moment.</p>
                    <p className="text-sm mt-2">New elections will be created automatically.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fundraising Activities */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Build Your War Chest</h3>
              <p className="text-white/80 text-sm mb-4">Raise funds before declaring candidacy for higher offices</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => performFundraisingAction('donor_meeting')}
                  disabled={loading || currentUser.profile.approval < 5}
                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-400 text-white p-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-bold mb-2">Donor Meeting</div>
                  <div className="text-sm mb-2">Meet with wealthy donors</div>
                  <div className="text-xs">+$500 • -2% Approval</div>
                  <div className="text-xs text-green-400 mt-1">
                    {currentUser.profile.approval < 5 ? 'Need 5% Approval' : 'Available'}
                  </div>
                </button>

                <button
                  onClick={() => performFundraisingAction('grassroots_event')}
                  disabled={loading}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400 text-white p-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-bold mb-2">Grassroots Event</div>
                  <div className="text-sm mb-2">Small donor fundraiser</div>
                  <div className="text-xs">+$200 • +1% Approval</div>
                  <div className="text-xs text-blue-400 mt-1">Always Available</div>
                </button>

                <button
                  onClick={() => performFundraisingAction('pac_contribution')}
                  disabled={loading || currentUser.profile.politicalCapital < 5}
                  className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400 text-white p-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-bold mb-2">PAC Contribution</div>
                  <div className="text-sm mb-2">Political Action Committee</div>
                  <div className="text-xs">+$1,500 • -5 Political Capital</div>
                  <div className="text-xs text-purple-400 mt-1">
                    {currentUser.profile.politicalCapital < 5 ? 'Need 5 Political Capital' : 'Available'}
                  </div>
                </button>
              </div>
            </div>

            {/* Online Players with Profile Viewing */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Online Politicians ({allPlayers.length})</h3>
              <div className="grid gap-3">
                {allPlayers.map((player) => (
                  <div key={player.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-white font-bold flex items-center">
                          {player.profile.firstName} {player.profile.lastName} ({player.username})
                          {player.id === currentUser.id && <span className="ml-2 text-yellow-400">(You)</span>}
                        </div>
                        <div className="text-white/70 text-sm">
                          {player.profile.party} • {player.profile.homeState} • {player.profile.currentOffice}
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          Approval: {player.profile.approval}% • Capital: {player.profile.politicalCapital}
                        </div>
                      </div>
                      
                      {player.id !== currentUser.id && (
                        <button
                          onClick={() => alert('Player profile viewing coming soon!')}
                          className="text-white/60 hover:text-white transition-all"
                          title="View Profile"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs text-white ${
                        parties.find(p => p.name === player.profile.party)?.color || 'bg-gray-500'
                      }`}>
                        {parties.find(p => p.name === player.profile.party)?.abbreviation || 'I'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {allPlayers.length === 0 && (
                  <div className="text-center text-white/60 py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No other players online at the moment.</p>
                    <p className="text-sm mt-2">Invite friends to join the political arena!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Profile Edit Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Edit Your Profile</h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">First Name</label>
                    <input
                      type="text"
                      value={currentUser.profile.firstName || ''}
                      onChange={(e) => updateProfile('firstName', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Last Name</label>
                    <input
                      type="text"
                      value={currentUser.profile.lastName || ''}
                      onChange={(e) => updateProfile('lastName', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Age</label>
                    <input
                      type="number"
                      min="18"
                      max="120"
                      value={currentUser.profile.age || ''}
                      onChange={(e) => updateProfile('age', parseInt(e.target.value) || '')}
                      className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Gender</label>
                    <select
                      value={currentUser.profile.gender || ''}
                      onChange={(e) => updateProfile('gender', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white text-black border border-white/30"
                    >
                      <option value="" className="bg-white text-black">Select Gender</option>
                      {genderOptions.map(option => (
                        <option key={option} value={option} className="bg-white text-black">{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Race/Ethnicity</label>
                    <select
                      value={currentUser.profile.race || ''}
                      onChange={(e) => updateProfile('race', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white text-black border border-white/30"
                    >
                      <option value="" className="bg-white text-black">Select Race/Ethnicity</option>
                      {raceOptions.map(option => (
                        <option key={option} value={option} className="bg-white text-black">{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-2">Religion</label>
                    <select
                      value={currentUser.profile.religion || ''}
                      onChange={(e) => updateProfile('religion', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white text-black border border-white/30"
                    >
                      <option value="" className="bg-white text-black">Select Religion</option>
                      {religionOptions.map(option => (
                        <option key={option} value={option} className="bg-white text-black">{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Political Bio</label>
                  <textarea
                    value={currentUser.profile.bio || ''}
                    onChange={(e) => updateProfile('bio', e.target.value)}
                    placeholder="Tell voters about your background and political goals..."
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 h-24"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PoliticalGame;
