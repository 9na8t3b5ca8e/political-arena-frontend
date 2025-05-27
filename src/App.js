import React, { useState, useEffect } from 'react';
import { Users, Vote, DollarSign, TrendingUp, MessageCircle, Trophy, Calendar, Map, User, Settings, Globe, Clock, Star, AlertCircle, CheckCircle, Gavel } from 'lucide-react';

const PoliticalGame = () => {
  const [gameState, setGameState] = useState('login'); // login, register, lobby, profile, elections, campaign, voting, results, governance
  const [currentUser, setCurrentUser] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [activeElections, setActiveElections] = useState([]);
  const [currentElection, setCurrentElection] = useState(null);
  const [campaignTimer, setCampaignTimer] = useState(0);
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

  // Comprehensive state data
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

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: ''
  });

  const parties = [
    { name: 'Democrat', color: 'bg-blue-600', abbreviation: 'D' },
    { name: 'Republican', color: 'bg-red-600', abbreviation: 'R' },
    { name: 'Independent', color: 'bg-purple-600', abbreviation: 'I' }
  ];

  const offices = [
    { name: 'State Legislature', level: 1, description: 'State House/Senate', filingFee: 500, campaignLength: 21 },
    { name: 'Governor', level: 2, description: 'State Executive', filingFee: 2000, campaignLength: 30 },
    { name: 'House Representative', level: 3, description: 'Federal House', filingFee: 1000, campaignLength: 28 },
    { name: 'Senator', level: 4, description: 'Federal Senate', filingFee: 5000, campaignLength: 35 },
    { name: 'President', level: 5, description: 'Chief Executive', filingFee: 10000, campaignLength: 42 }
  ];

  const campaignActions = [
    { 
      name: 'Rally', 
      cost: 300, 
      approvalBoost: 3, 
      fundingChange: -300,
      description: 'Hold a public rally to energize supporters',
      timeRequired: 2,
      riskLevel: 'low'
    },
    { 
      name: 'TV Advertisement', 
      cost: 1000, 
      approvalBoost: 7, 
      fundingChange: -1000,
      description: 'Run television ads across the state',
      timeRequired: 1,
      riskLevel: 'low'
    },
    { 
      name: 'Town Hall', 
      cost: 150, 
      approvalBoost: 4, 
      fundingChange: -150,
      description: 'Host an interactive town hall meeting',
      timeRequired: 2,
      riskLevel: 'medium'
    },
    { 
      name: 'Fundraising Dinner', 
      cost: 200, 
      approvalBoost: -1, 
      fundingChange: 800,
      description: 'Exclusive fundraising event with donors', 
      timeRequired: 1,
      riskLevel: 'medium'
    },
    { 
      name: 'Door-to-Door Canvassing', 
      cost: 0, 
      approvalBoost: 2, 
      fundingChange: 0,
      description: 'Personal voter outreach in neighborhoods',
      timeRequired: 3,
      riskLevel: 'low'
    },
    { 
      name: 'Digital Campaign', 
      cost: 500, 
      approvalBoost: 4, 
      fundingChange: -500,
      description: 'Social media and online advertising',
      timeRequired: 1,
      riskLevel: 'low'
    },
    { 
      name: 'Debate Preparation', 
      cost: 100, 
      approvalBoost: 0, 
      fundingChange: -100,
      description: 'Prepare for upcoming debates',
      timeRequired: 2,
      riskLevel: 'low'
    },
    { 
      name: 'Policy Speech', 
      cost: 200, 
      approvalBoost: 5, 
      fundingChange: -200,
      description: 'Major policy address to voters',
      timeRequired: 2,
      riskLevel: 'high'
    }
  ];

  // Initialize mock players and elections
  useEffect(() => {
    if (gameState === 'lobby' && allPlayers.length <= 1) {
      const mockPlayers = [
        {
          id: 2,
          username: 'PoliticsPro',
          profile: { 
            firstName: 'Sarah', 
            lastName: 'Johnson', 
            party: 'Democrat', 
            homeState: 'California', 
            currentOffice: 'State Legislature',
            economicStance: 2,
            socialStance: 2,
            approval: 67,
            campaignFunds: 2500,
            politicalCapital: 15
          }
        },
        {
          id: 3,
          username: 'ConservativeVoice',
          profile: { 
            firstName: 'Mike', 
            lastName: 'Smith', 
            party: 'Republican', 
            homeState: 'Texas', 
            currentOffice: 'Governor',
            economicStance: 6,
            socialStance: 6,
            approval: 72,
            campaignFunds: 5000,
            politicalCapital: 20
          }
        },
        {
          id: 4,
          username: 'IndependentMind',
          profile: { 
            firstName: 'Alex', 
            lastName: 'Chen', 
            party: 'Independent', 
            homeState: 'Colorado', 
            currentOffice: 'House Representative',
            economicStance: 4,
            socialStance: 3,
            approval: 58,
            campaignFunds: 1800,
            politicalCapital: 12
          }
        }
      ];
      
      if (currentUser) {
        setAllPlayers([currentUser, ...mockPlayers]);
        
        // Create some active elections
        setActiveElections([
          {
            id: 1,
            office: 'Governor',
            state: currentUser.profile.homeState,
            status: 'accepting_candidates',
            candidates: [],
            timeRemaining: 168, // 7 days to file
            filingDeadline: Date.now() + (7 * 24 * 60 * 60 * 1000),
            campaignStart: Date.now() + (7 * 24 * 60 * 60 * 1000),
            electionDate: Date.now() + (37 * 24 * 60 * 60 * 1000),
            filingFee: 2000
          },
          {
            id: 2,
            office: 'House Representative',
            state: 'California',
            status: 'campaign_active',
            candidates: [
              { playerId: 2, name: 'Sarah Johnson', party: 'Democrat', approval: 67, campaignFunds: 2500 }
            ],
            timeRemaining: 480, // 20 days
            campaignStart: Date.now() - (10 * 24 * 60 * 60 * 1000),
            electionDate: Date.now() + (20 * 24 * 60 * 60 * 1000),
            filingFee: 1000
          },
          {
            id: 3,
            office: 'State Legislature',
            state: 'Texas',
            status: 'voting_open',
            candidates: [
              { playerId: 3, name: 'Mike Smith', party: 'Republican', approval: 72, votes: 15420 },
              { playerId: null, name: 'Jennifer Lopez', party: 'Democrat', approval: 45, votes: 12130 }
            ],
            timeRemaining: 24, // 1 day left to vote
            electionDate: Date.now() + (1 * 24 * 60 * 60 * 1000),
            filingFee: 500
          }
        ]);
      }
    }
  }, [gameState, currentUser]);

  // Campaign timer effect
  useEffect(() => {
    if (gameState === 'campaign' && currentElection && campaignTimer > 0) {
      const timer = setTimeout(() => {
        setCampaignTimer(prev => prev - 1);
        if (campaignTimer <= 1) {
          setGameState('voting');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, campaignTimer, currentElection]);

  // Authentication functions
  const handleLogin = () => {
    if (loginForm.username && loginForm.password) {
      const user = {
        id: Date.now(),
        username: loginForm.username,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          party: '',
          economicStance: 4,
          socialStance: 4,
          homeState: '',
          bio: '',
          currentOffice: 'Citizen',
          politicalCapital: 10,
          approval: 50,
          campaignFunds: 1000
        }
      };
      setCurrentUser(user);
      setGameState('profile');
    }
  };

  const handleRegister = () => {
    if (registerForm.username && registerForm.email && registerForm.password === registerForm.confirmPassword) {
      const user = {
        id: Date.now(),
        username: registerForm.username,
        email: registerForm.email,
        profile: {
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          party: '',
          economicStance: 4,
          socialStance: 4,
          homeState: '',
          bio: '',
          currentOffice: 'Citizen',
          politicalCapital: 10,
          approval: 50,
          campaignFunds: 1000
        }
      };
      setCurrentUser(user);
      setGameState('profile');
    }
  };

  const updateProfile = (field, value) => {
    setCurrentUser(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
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

  const enterLobby = () => {
    if (currentUser.profile.party && currentUser.profile.homeState) {
      setGameState('lobby');
    }
  };

  // Election functions
  const fileForElection = (election) => {
    if (currentUser.profile.campaignFunds >= election.filingFee) {
      const updatedElection = {
        ...election,
        candidates: [...election.candidates, {
          playerId: currentUser.id,
          name: `${currentUser.profile.firstName} ${currentUser.profile.lastName}`,
          party: currentUser.profile.party,
          approval: currentUser.profile.approval,
          campaignFunds: currentUser.profile.campaignFunds - election.filingFee,
          economicStance: currentUser.profile.economicStance,
          socialStance: currentUser.profile.socialStance,
          campaignActions: []
        }]
      };
      
      setActiveElections(prev => 
        prev.map(e => e.id === election.id ? updatedElection : e)
      );
      
      setCurrentUser(prev => ({
        ...prev,
        profile: { ...prev.profile, campaignFunds: prev.profile.campaignFunds - election.filingFee }
      }));
    }
  };

  const startCampaign = (election) => {
    setCurrentElection(election);
    setCampaignTimer(election.timeRemaining || 1440); // Default 24 hours in minutes
    setGameState('campaign');
  };

  const performCampaignAction = (action) => {
    if (!currentElection || !currentUser) return;
    
    if (currentUser.profile.campaignFunds >= action.cost && campaignTimer >= action.timeRequired) {
      // Calculate effectiveness based on state alignment
      const stateAlignment = calculateStateAlignment(
        currentUser.profile.economicStance,
        currentUser.profile.socialStance,
        currentElection.state
      );
      
      const effectivenessMultiplier = (stateAlignment / 100) + 0.5; // 0.5 to 1.5 multiplier
      const actualApprovalBoost = Math.round(action.approvalBoost * effectivenessMultiplier);
      
      // Random event chance based on action risk
      let eventMessage = '';
      const randomEvent = Math.random();
      if (action.riskLevel === 'high' && randomEvent < 0.15) {
        eventMessage = 'Your speech received mixed reactions in the media!';
      } else if (action.riskLevel === 'medium' && randomEvent < 0.1) {
        eventMessage = 'A minor controversy arose from this action.';
      }
      
      setCurrentUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          approval: Math.min(100, Math.max(0, prev.profile.approval + actualApprovalBoost)),
          campaignFunds: prev.profile.campaignFunds + action.fundingChange
        }
      }));
      
      setCampaignTimer(prev => prev - action.timeRequired);
      
      // Update election with action taken
      setCurrentElection(prev => ({
        ...prev,
        candidates: prev.candidates.map(candidate => 
          candidate.playerId === currentUser.id 
            ? {
                ...candidate, 
                campaignActions: [...(candidate.campaignActions || []), {
                  action: action.name,
                  effectiveness: effectivenessMultiplier,
                  event: eventMessage
                }]
              }
            : candidate
        )
      }));
    }
  };

  const simulateElection = () => {
    if (!currentElection) return;
    
    // Calculate votes for each candidate
    const results = currentElection.candidates.map(candidate => {
      const baseVotes = Math.floor(Math.random() * 5000) + 1000;
      const approvalMultiplier = candidate.approval / 50; // Normalize around 50%
      const stateAlignment = candidate.playerId === currentUser.id 
        ? calculateStateAlignment(candidate.economicStance, candidate.socialStance, currentElection.state)
        : Math.random() * 100;
      const alignmentMultiplier = stateAlignment / 100;
      
      const totalVotes = Math.floor(baseVotes * approvalMultiplier * alignmentMultiplier);
      
      return {
        ...candidate,
        votes: totalVotes,
        votePercentage: 0 // Will calculate after all votes are tallied
      };
    }).sort((a, b) => b.votes - a.votes);
    
    // Calculate percentages
    const totalVotes = results.reduce((sum, candidate) => sum + candidate.votes, 0);
    results.forEach(candidate => {
      candidate.votePercentage = ((candidate.votes / totalVotes) * 100).toFixed(1);
    });
    
    const winner = results[0];
    const playerResult = results.find(r => r.playerId === currentUser.id);
    const playerWon = winner.playerId === currentUser.id;
    
    // Update player profile if they won
    if (playerWon) {
      setCurrentUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          currentOffice: currentElection.office,
          politicalCapital: prev.profile.politicalCapital + 10,
          approval: Math.min(100, prev.profile.approval + 15)
        }
      }));
    }
    
    setCurrentElection(prev => ({
      ...prev,
      status: 'completed',
      results,
      winner,
      playerWon
    }));
    
    setGameState('results');
  };

  const formatTime = (minutes) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Login
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
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-lg font-bold hover:from-green-700 hover:to-blue-700 transition-all"
              >
                Create Account
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
                    value={currentUser.profile.homeState}
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
                  value={currentUser.profile.bio}
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
            {/* Player Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center text-white">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{currentUser.profile.approval}%</div>
                  <div className="text-sm opacity-80">Approval</div>
                </div>
                <div className="text-center text-white">
                  <DollarSign className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-2xl font-bold">${currentUser.profile.campaignFunds.toLocaleString()}</div>
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

            {/* Active Elections */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Active Elections ({activeElections.length})</h3>
              <div className="grid gap-4">
                {activeElections.map((election) => {
                  const userIsCandidate = election.candidates.some(c => c.playerId === currentUser.id);
                  const canFile = election.status === 'accepting_candidates' && !userIsCandidate && currentUser.profile.campaignFunds >= election.filingFee;
                  const canCampaign = election.status === 'campaign_active' && userIsCandidate;
                  
                  return (
                    <div key={election.id} className="bg-white/10 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-bold text-lg">{election.office}</h4>
                          <p className="text-white/70">{election.state} • Filing Fee: ${election.filingFee.toLocaleString()}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="w-4 h-4 text-white/60 mr-2" />
                            <span className="text-white/80 text-sm">
                              {election.status === 'accepting_candidates' && `Filing ends in ${formatTime(election.timeRemaining)}`}
                              {election.status === 'campaign_active' && `Election in ${formatTime(election.timeRemaining)}`}
                              {election.status === 'voting_open' && `Voting ends in ${formatTime(election.timeRemaining)}`}
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          election.status === 'accepting_candidates' ? 'bg-yellow-600 text-white' :
                          election.status === 'campaign_active' ? 'bg-blue-600 text-white' :
                          election.status === 'voting_open' ? 'bg-green-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {election.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Candidates */}
                      {election.candidates.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-white font-bold mb-2">Candidates ({election.candidates.length})</h5>
                          <div className="grid gap-2">
                            {election.candidates.map((candidate, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white/10 p-3 rounded">
                                <div>
                                  <span className="text-white font-bold">
                                    {candidate.name} {candidate.playerId === currentUser.id && '(You)'}
                                  </span>
                                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    parties.find(p => p.name === candidate.party)?.color || 'bg-gray-500'
                                  } text-white`}>
                                    {parties.find(p => p.name === candidate.party)?.abbreviation || 'I'}
                                  </span>
                                </div>
                                <div className="text-white text-sm">
                                  {election.status === 'voting_open' && candidate.votes 
                                    ? `${candidate.votes.toLocaleString()} votes`
                                    : `${candidate.approval}% approval`
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        {canFile && (
                          <button
                            onClick={() => fileForElection(election)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            File for ${election.filingFee.toLocaleString()}
                          </button>
                        )}
                        
                        {canCampaign && (
                          <button
                            onClick={() => startCampaign(election)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center"
                          >
                            <Vote className="w-4 h-4 mr-2" />
                            Campaign Now
                          </button>
                        )}
                        
                        {election.status === 'voting_open' && (
                          <button
                            onClick={() => simulateElection()}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            View Results
                          </button>
                        )}
                        
                        {!userIsCandidate && election.status !== 'accepting_candidates' && (
                          <div className="text-white/60 text-sm py-2">
                            {election.status === 'campaign_active' && 'Campaign in progress'}
                            {election.status === 'voting_open' && 'Voting in progress'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                  <div className="text-xs text-green-400 mt-1">Requires 5% Approval</div>
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
                  <div className="text-xs text-purple-400 mt-1">Requires 5 Political Capital</div>
                </button>
              </div>

              <div className="mt-4 bg-white/10 p-4 rounded-lg">
                <h4 className="text-white font-bold mb-2">Fundraising Tips:</h4>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• Governor races require $2,000 filing fee</li>
                  <li>• Senate races require $5,000 filing fee</li>
                  <li>• Presidential races require $10,000 filing fee</li>
                  <li>• Balance donor meetings (quick money) vs grassroots (approval boost)</li>
                  <li>• Use political capital for major PAC contributions</li>
                </ul>
              </div>
            </div>

            {/* Online Players */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Online Politicians ({allPlayers.length})</h3>
              <div className="grid gap-3">
                {allPlayers.map((player) => (
                  <div key={player.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">
                        {player.profile.firstName} {player.profile.lastName} ({player.username})
                        {player.id === currentUser.id && ' (You)'}
                      </div>
                      <div className="text-white/70 text-sm">
                        {player.profile.party} • {player.profile.homeState} • {player.profile.currentOffice}
                      </div>
                      <div className="text-white/60 text-xs mt-1">
                        Approval: {player.profile.approval}% • 
                        Funds: ${player.profile.campaignFunds?.toLocaleString() || '0'} • 
                        Capital: {player.profile.politicalCapital}
                      </div>
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
              </div>
            </div>
          </div>
        )}

        {/* Campaign Screen */}
        {gameState === 'campaign' && currentElection && currentUser && (
          <div className="space-y-6">
            {/* Campaign Header */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Campaigning for {currentElection.office}
                </h2>
                <p className="text-white/80 mb-4">{currentElection.state}</p>
                <div className="flex justify-center items-center space-x-6">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-white" />
                    <div className="text-2xl font-bold text-white">{formatTime(campaignTimer)}</div>
                    <div className="text-white/80 text-sm">Time Remaining</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-white" />
                    <div className="text-2xl font-bold text-white">{currentUser.profile.approval}%</div>
                    <div className="text-white/80 text-sm">Approval Rating</div>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-1 text-white" />
                    <div className="text-2xl font-bold text-white">${currentUser.profile.campaignFunds.toLocaleString()}</div>
                    <div className="text-white/80 text-sm">Campaign Funds</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Campaign Actions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {campaignActions.map((action, idx) => {
                  const canAfford = currentUser.profile.campaignFunds >= action.cost;
                  const hasTime = campaignTimer >= action.timeRequired;
                  const canPerform = canAfford && hasTime;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => performCampaignAction(action)}
                      disabled={!canPerform}
                      className={`p-4 rounded-lg text-left transition-all ${
                        canPerform 
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50'
                          : 'bg-white/5 text-white/50 border border-white/10 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg">{action.name}</div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          action.riskLevel === 'low' ? 'bg-green-600' :
                          action.riskLevel === 'medium' ? 'bg-yellow-600' :
                          'bg-red-600'
                        } text-white`}>
                          {action.riskLevel.toUpperCase()} RISK
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3 opacity-80">{action.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="opacity-70">Cost</div>
                          <div className="font-bold">${action.cost}</div>
                        </div>
                        <div>
                          <div className="opacity-70">Approval</div>
                          <div className="font-bold">
                            {action.approvalBoost > 0 ? '+' : ''}{action.approvalBoost}%
                          </div>
                        </div>
                        <div>
                          <div className="opacity-70">Time</div>
                          <div className="font-bold">{action.timeRequired}h</div>
                        </div>
                      </div>
                      
                      {!canAfford && (
                        <div className="text-red-400 text-xs mt-2">Insufficient funds</div>
                      )}
                      {!hasTime && canAfford && (
                        <div className="text-yellow-400 text-xs mt-2">Not enough time</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opponents */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Your Opponents</h3>
              <div className="grid gap-3">
                {currentElection.candidates.filter(c => c.playerId !== currentUser.id).map((candidate, idx) => (
                  <div key={idx} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">{candidate.name}</div>
                      <div className="text-white/70 text-sm">{candidate.party}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{candidate.approval}%</div>
                      <div className="text-white/70 text-sm">Approval</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => setGameState('lobby')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Back to Lobby
              </button>
              
              {campaignTimer <= 0 && (
                <button
                  onClick={() => setGameState('voting')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center"
                >
                  <Vote className="w-5 h-5 mr-2" />
                  Proceed to Election
                </button>
              )}
            </div>
          </div>
        )}

        {/* Voting Screen */}
        {gameState === 'voting' && currentElection && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Election Day!</h2>
            <p className="text-white/80">Votes are being counted for {currentElection.office} in {currentElection.state}...</p>
            
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-white font-bold mb-4">Final Candidates</h3>
              <div className="grid gap-3">
                {currentElection.candidates.map((candidate, idx) => (
                  <div key={idx} className={`p-3 rounded flex justify-between items-center ${
                    candidate.playerId === currentUser.id ? 'bg-yellow-600/30 border border-yellow-400' : 'bg-white/10'
                  }`}>
                    <div className="text-white">
                      <span className="font-bold">{candidate.name}</span>
                      {candidate.playerId === currentUser.id && <span className="ml-2 text-yellow-400">(You)</span>}
                      <div className="text-sm opacity-80">{candidate.party}</div>
                    </div>
                    <div className="text-white text-right">
                      <div className="font-bold">{candidate.approval}%</div>
                      <div className="text-sm opacity-80">Final Approval</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={simulateElection}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center mx-auto"
            >
              <Gavel className="w-6 h-6 mr-2" />
              Count Votes & Declare Winner
            </button>
          </div>
        )}

        {/* Results Screen */}
        {gameState === 'results' && currentElection && currentElection.results && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Election Results</h2>
              <div className="text-xl font-bold mb-4">
                <span className="text-white">Winner: </span>
                <span className={currentElection.playerWon ? 'text-green-400' : 'text-white'}>
                  {currentElection.winner.name}
                </span>
              </div>
              
              {currentElection.playerWon ? (
                <div className="bg-green-600/20 border border-green-400 p-4 rounded-lg">
                  <div className="text-green-400 font-bold text-xl mb-2">🎉 Congratulations!</div>
                  <div className="text-white">You won the election for {currentElection.office}!</div>
                  <div className="text-white/80 text-sm mt-2">
                    +10 Political Capital • +15% Approval • Office: {currentElection.office}
                  </div>
                </div>
              ) : (
                <div className="bg-red-600/20 border border-red-400 p-4 rounded-lg">
                  <div className="text-red-400 font-bold text-xl mb-2">Election Lost</div>
                  <div className="text-white">Better luck next time! Keep building your political career.</div>
                </div>
              )}
            </div>

            {/* Detailed Results */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Final Vote Count</h3>
              <div className="space-y-3">
                {currentElection.results.map((candidate, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${
                    idx === 0 ? 'bg-green-600/30 border border-green-400' : 
                    candidate.playerId === currentUser.id ? 'bg-yellow-600/20 border border-yellow-400' : 
                    'bg-white/10'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold flex items-center">
                          {idx === 0 && <Trophy className="w-5 h-5 mr-2 text-yellow-400" />}
                          {candidate.name} 
                          {candidate.playerId === currentUser.id && <span className="ml-2 text-yellow-400">(You)</span>}
                        </div>
                        <div className="text-white/70 text-sm">{candidate.party}</div>
                      </div>
                      <div className="text-white text-right">
                        <div className="font-bold text-lg">{candidate.votes.toLocaleString()} votes</div>
                        <div className="text-sm opacity-70">{candidate.votePercentage}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-white/80 text-sm text-center">
                Total Votes Cast: {currentElection.results.reduce((sum, c) => sum + c.votes, 0).toLocaleString()}
              </div>
            </div>

            {/* Next Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => setGameState('lobby')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-bold transition-all"
              >
                Return to Lobby
              </button>
              
              {currentElection.playerWon && (
                <button
                  onClick={() => setGameState('governance')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold transition-all flex items-center justify-center"
                >
                  <Gavel className="w-5 h-5 mr-2" />
                  Begin Governing
                </button>
              )}
            </div>
          </div>
        )}

        {/* Governance Screen (Placeholder) */}
        {gameState === 'governance' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Governance Dashboard</h2>
            <p className="text-white/80 mb-6">
              Congratulations on your election victory! The governance system is coming in Phase 2.
            </p>
            <div className="text-white/60 text-sm mb-6">
              Features coming soon: Legislative voting, budget management, policy implementation, and more!
            </div>
            <button
              onClick={() => setGameState('lobby')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Back to Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliticalGame;