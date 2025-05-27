import React, { useState, useEffect, useCallback } from 'react';
import { Users, Vote, DollarSign, TrendingUp, Trophy, Map, User, Globe, Clock, Star, AlertCircle, Edit, Eye, Timer, Target, BarChart2, Briefcase } from 'lucide-react';

const API_BASE_URL = 'http://localhost:10000/api'; // Use localhost for dev, change for prod

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const config = {
    headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
    ...options
  };
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.errors ? data.errors[0].msg : data.error;
      throw new Error(errorMsg || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

function PoliticalGame() {
  const [gameState, setGameState] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeElections, setActiveElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [pollingData, setPollingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });

  const { allStates, stateData } = require('./state-data');
  const stanceScale = [{ value: 1, label: 'Far Left' }, { value: 2, label: 'Left' }, { value: 3, label: 'Center-Left' }, { value: 4, label: 'Moderate' }, { value: 5, label: 'Center-Right' }, { value: 6, label: 'Right' }, { value: 7, label: 'Far Right' }];

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await apiCall('/auth/profile');
      setCurrentUser(profile);
      if (profile.party && profile.home_state) {
        setGameState('lobby');
        loadLobbyData();
      } else {
        setGameState('profile');
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      setGameState('login');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLobbyData = async () => {
    try {
      const [elections] = await Promise.all([apiCall('/elections')]);
      setActiveElections(elections);
    } catch (error) { setError('Failed to load game data'); }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [loadUserProfile]);
  
  // Auto-refresh data
  useEffect(() => {
    if (gameState === 'lobby') {
      const interval = setInterval(() => { loadLobbyData(); }, 30000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const handleAuth = async (action, form) => {
    try {
      setLoading(true); setError('');
      const response = await apiCall(`/auth/${action}`, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('authToken', response.token);
      await loadUserProfile();
    } catch (error) { setError(error.message); } 
    finally { setLoading(false); }
  };

  const updateProfile = async (updateData) => {
    try {
        setCurrentUser(prev => ({...prev, ...updateData}));
        await apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify(updateData) });
    } catch(err) { setError(err.message) }
  }

  const handleFundraise = async (type) => {
    try {
        setLoading(true); setError('');
        const res = await apiCall('/actions/fundraise', { method: 'POST', body: JSON.stringify({type}) });
        setCurrentUser(prev => ({ ...prev, ...res.newStats}));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const handleAttackAd = async (targetUserId) => {
    try {
        setLoading(true); setError('');
        const res = await apiCall('/actions/attack', { method: 'POST', body: JSON.stringify({targetUserId}) });
        setCurrentUser(prev => ({...prev, campaign_funds: res.newFunds, action_points: res.newAP }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const handleViewElection = async (electionId) => {
    if (selectedElection && selectedElection.id === electionId) {
        setSelectedElection(null); // Toggle off
        return;
    }
    try {
        setLoading(true);
        const electionDetails = await apiCall(`/elections/${electionId}`);
        setSelectedElection(electionDetails);
        setPollingData([]); // Reset polling data
    } catch (err) { setError(err.message) }
    finally { setLoading(false); }
  }
  
  const handleViewPolling = async (electionId) => {
      try {
          setLoading(true);
          const polling = await apiCall(`/elections/${electionId}/polling`);
          setPollingData(polling);
      } catch(err) { setError(err.message)}
      finally {setLoading(false); }
  }

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setGameState('login');
    setError('');
  };

  if(loading && !currentUser) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {currentUser && gameState !== 'login' && gameState !== 'register' && (
             <header className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-400">Political Arena</h1>
                    <p className="text-sm text-gray-400">{currentUser.username}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div title="Approval Rating"><TrendingUp className="inline-block" size={18}/> {currentUser.approval_rating}%</div>
                    <div title="Campaign Funds"><DollarSign className="inline-block"  size={18}/> ${currentUser.campaign_funds.toLocaleString()}</div>
                    <div title="Political Capital"><Briefcase className="inline-block"  size={18}/> {currentUser.political_capital}</div>
                    <div title="Action Points"><Timer className="inline-block"  size={18}/> {currentUser.action_points}</div>
                    <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
                </div>
            </header>
        )}

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4" onClick={() => setError('')}>Error: {error}</div>}

        {/* Auth Screens */}
        {gameState === 'login' && <AuthScreen title="Login" form={loginForm} setForm={setLoginForm} action="login" handleAuth={handleAuth} setGameState={setGameState} />}
        {gameState === 'register' && <AuthScreen title="Register" form={registerForm} setForm={setRegisterForm} action="register" handleAuth={handleAuth} setGameState={setGameState} />}

        {/* Profile Setup */}
        {gameState === 'profile' && <ProfileSetup currentUser={currentUser} updateProfile={updateProfile} allStates={allStates} stanceScale={stanceScale} setGameState={setGameState}/> }
        
        {/* Main Lobby */}
        {gameState === 'lobby' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                    <ElectionsList elections={activeElections} onSelect={handleViewElection} selectedId={selectedElection?.id} />
                    {selectedElection && <ElectionDetails election={selectedElection} currentUser={currentUser} onAttack={handleAttackAd} onPolling={handleViewPolling} pollingData={pollingData} setError={setError} />}
                </div>
                <div className="space-y-4">
                    <Fundraising onFundraise={handleFundraise} />
                    {/* Placeholder for future components like Players Online */}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

const AuthScreen = ({ title, form, setForm, action, handleAuth, setGameState }) => {
    const isRegister = action === 'register';
    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAuth(action, form); }} className="space-y-4">
                {isRegister && (
                    <div className="grid grid-cols-2 gap-4">
                        <input name="firstName" placeholder="First Name" onChange={handleChange} className="p-2 bg-gray-700 rounded w-full"/>
                        <input name="lastName" placeholder="Last Name" onChange={handleChange} className="p-2 bg-gray-700 rounded w-full"/>
                    </div>
                )}
                <input name="username" placeholder="Username" onChange={handleChange} className="p-2 bg-gray-700 rounded w-full"/>
                {isRegister && <input name="email" type="email" placeholder="Email" onChange={handleChange} className="p-2 bg-gray-700 rounded w-full"/>}
                <input name="password" type="password" placeholder="Password" onChange={handleChange} className="p-2 bg-gray-700 rounded w-full"/>
                {isRegister && <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} className="p-2 bg-gray-700 rounded w-full"/>}
                <button type="submit" className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 font-bold">{title}</button>
                <p className="text-center text-sm">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}
                    <button type="button" onClick={() => setGameState(isRegister ? 'login' : 'register')} className="text-blue-400 hover:underline ml-1">
                        {isRegister ? 'Login' : 'Register'}
                    </button>
                </p>
            </form>
        </div>
    );
};

const ProfileSetup = ({currentUser, updateProfile, allStates, stanceScale, setGameState}) => {
    const getStanceLabel = (value) => stanceScale.find(s => s.value === value)?.label || 'Moderate';
    return(
        <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg space-y-6">
            <h2 className="text-2xl font-bold">Create Your Political Persona</h2>
            {/* Party & State */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-bold">Political Party</label>
                    <select value={currentUser.party || ''} onChange={(e) => updateProfile({party: e.target.value})} className="w-full p-2 bg-gray-700 rounded">
                        <option value="">Select Party</option>
                        <option value="Democrat">Democrat</option>
                        <option value="Republican">Republican</option>
                        <option value="Independent">Independent</option>
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-bold">Home State</label>
                    <select value={currentUser.home_state || ''} onChange={(e) => updateProfile({homeState: e.target.value})} className="w-full p-2 bg-gray-700 rounded">
                        <option value="">Select State</option>
                        {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            {/* Stances */}
            <div>
                <label className="block mb-1 text-sm font-bold">Economic Stance: {getStanceLabel(currentUser.economic_stance)}</label>
                <input type="range" min="1" max="7" value={currentUser.economic_stance} onChange={e => updateProfile({economicStance: parseInt(e.target.value)})} className="w-full"/>
            </div>
             <div>
                <label className="block mb-1 text-sm font-bold">Social Stance: {getStanceLabel(currentUser.social_stance)}</label>
                <input type="range" min="1" max="7" value={currentUser.social_stance} onChange={e => updateProfile({socialStance: parseInt(e.target.value)})} className="w-full"/>
            </div>
            <button disabled={!currentUser.party || !currentUser.home_state} onClick={() => setGameState('lobby')} className="w-full bg-green-600 p-2 rounded font-bold hover:bg-green-700 disabled:bg-gray-500">Enter the Arena</button>
        </div>
    )
}

const ElectionsList = ({ elections, onSelect, selectedId }) => {
    const formatTime = (deadline) => {
        const diff = new Date(deadline) - new Date();
        if (diff < 0) return "Closed";
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Active Elections</h3>
            <div className="space-y-2">
                {elections.map(e => (
                    <div key={e.id} onClick={() => onSelect(e.id)} className={`p-3 rounded-lg cursor-pointer ${selectedId === e.id ? 'bg-blue-500/30' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
                        <div className="flex justify-between">
                            <span className="font-bold">{e.office}, {e.state}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.type === 'primary' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{e.type.charAt(0).toUpperCase() + e.type.slice(1)}</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Filing Closes: {formatTime(e.filing_deadline)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ElectionDetails = ({ election, currentUser, onAttack, onPolling, pollingData, setError }) => {
    const [isFiling, setIsFiling] = useState(false);
    const userIsCandidate = election.candidates.some(c => c.user_id === currentUser.id);

    const handleFile = async () => {
        setIsFiling(true); setError('');
        try {
            await apiCall(`/elections/${election.id}/file`, {method: 'POST'});
            // TODO: Refresh data after filing
        } catch(err) { setError(err.message); }
        finally{ setIsFiling(false); }
    }

    return(
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">{election.office}, {election.state} - Details</h3>
            <div className="space-y-3">
                <p><span className="font-semibold">Status:</span> {election.status}</p>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                    <h4 className="font-bold mb-2">Candidates ({election.candidates.length})</h4>
                    <ul className="space-y-2">
                        {election.candidates.map(c => (
                            <li key={c.user_id} className="flex justify-between items-center">
                                <span>{c.first_name} {c.last_name} ({c.username}) - {c.party}</span>
                                {currentUser.id !== c.user_id && election.status === 'campaign_active' && (
                                    <button onClick={() => onAttack(c.user_id)} className="text-xs bg-red-500/50 px-2 py-1 rounded hover:bg-red-500/80"><Target size={14} className="inline"/> Attack</button>
                                )}
                            </li>
                        ))}
                    </ul>
                 </div>
                 {pollingData.length > 0 && (
                     <div className="bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="font-bold mb-2">Latest Polling</h4>
                        <ul className="space-y-1">
                            {pollingData.map(p => (
                                <li key={p.user_id}>{p.username}: {p.percentage}%</li>
                            ))}
                        </ul>
                     </div>
                 )}
                 <div className="flex space-x-2">
                    {election.status === 'accepting_candidates' && !userIsCandidate && (
                        <button onClick={handleFile} disabled={isFiling} className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-500">{isFiling ? 'Filing...' : 'File for Election'}</button>
                    )}
                    {election.status === 'campaign_active' && (
                        <button onClick={() => onPolling(election.id)} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"><BarChart2 size={16} className="inline"/> View Polling</button>
                    )}
                 </div>
            </div>
        </div>
    )
}

const Fundraising = ({ onFundraise }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Actions</h3>
        <div className="space-y-2">
            <button onClick={() => onFundraise('grassroots')} className="w-full text-left p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30">
                <div className="font-bold">Grassroots Fundraising</div>
                <div className="text-sm text-gray-300">+$2,500, +1% Approval. Costs 15 AP.</div>
            </button>
             <button onClick={() => onFundraise('major_donor')} className="w-full text-left p-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30">
                <div className="font-bold">Meet Major Donors</div>
                <div className="text-sm text-gray-300">+$15,000, -2% Approval. Costs 25 AP. (Req: 40% AR)</div>
            </button>
             <button onClick={() => onFundraise('pac')} className="w-full text-left p-3 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30">
                <div className="font-bold">Seek PAC Contribution</div>
                <div className="text-sm text-gray-300">+$25,000, -5% Approval. Costs 5 AP & 5 PC. (Req: 10 PC)</div>
            </button>
        </div>
    </div>
);


export default PoliticalGame;
