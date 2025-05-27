// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiCall } from './api';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import { allStates, stateData, stanceScale } from './state-data'; // Ensure stanceScale is exported
import StatePage from './pages/StatePage'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameDate, setGameDate] = useState(null); // << NEW STATE FOR GAME DATE

  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await apiCall('/auth/profile');
      setCurrentUser(profile);
    } catch (error) {
      localStorage.removeItem('authToken');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);
  
  // << NEW useEffect to fetch game date periodically >>
  useEffect(() => {
    if (currentUser) { // Only fetch if user is logged in
      const fetchGameDate = async () => {
        try {
          const dateData = await apiCall('/game/date');
          setGameDate(dateData);
        } catch (error) {
          console.error("Failed to fetch game date:", error);
          // Optionally set an error state or handle silently if this is not critical
        }
      };
      fetchGameDate(); // Initial fetch
      const intervalId = setInterval(fetchGameDate, 60000); // Fetch every minute
      return () => clearInterval(intervalId); // Cleanup interval on component unmount or if currentUser changes
    } else {
      setGameDate(null); // Clear game date if logged out
    }
  }, [currentUser]); // Re-run if currentUser changes (e.g., on login/logout)

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    // gameDate will be cleared by the useEffect above
  };

  const handleSuccessfulAuth = () => {
    setLoading(true);
    loadUserProfile(); // This will trigger the gameDate useEffect once currentUser is set
  }

  if (loading && currentUser === null) { // Refined loading condition to prevent flash of auth screen
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Application...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
        <div className="max-w-7xl mx-auto">
          {currentUser ? (
            <>
              {/* << PASS gameDate TO NAVBAR >> */}
              <Navbar currentUser={currentUser} logout={logout} gameDate={gameDate} /> 
              <main className="mt-6"> {/* Add some margin top for content below navbar */}
                <Routes>
                  <Route path="/" element={<HomePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/state/:stateName" element={<StatePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  <Route path="/profile" element={<ProfilePage />} /> {/* General profile link */}
                  <Route path="/profile/:userId" element={<ProfilePage />} /> {/* Specific user profile link */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </>
          ) : (
            <Routes>
                <Route path="*" element={<AuthRouter onAuthSuccess={handleSuccessfulAuth} />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

function AuthRouter({ onAuthSuccess }) {
    const [authAction, setAuthAction] = useState('login'); 
    const [profileDataForSetup, setProfileDataForSetup] = useState(null);

    if(profileDataForSetup) {
        return <ProfileSetup currentUser={profileDataForSetup} onSetupComplete={onAuthSuccess} />
    }
    return <AuthScreen action={authAction} setAction={setAuthAction} setProfileDataForSetup={setProfileDataForSetup} />
}

const AuthScreen = ({ action, setAction, setProfileDataForSetup }) => {
    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            if (action === 'register' && form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
            const response = await apiCall(`/auth/${action}`, { method: 'POST', body: JSON.stringify(form) });
            localStorage.setItem('authToken', response.token);
            
            if (action === 'register') {
                const profile = await apiCall('/auth/profile'); // Fetch the newly created profile
                setProfileDataForSetup(profile); // Pass it to AuthRouter to trigger ProfileSetup
            } else { 
                // For login, App.js's loadUserProfile will be called by onAuthSuccess,
                // which will set currentUser and re-render App to show the main layout.
                // We can directly call onAuthSuccess from App if passed down, or let App.js handle it.
                // For simplicity, we let App.js handle it via its useEffect on token change.
                window.location.reload(); // Simple way to trigger App.js reload and profile fetch
            }
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const isRegister = action === 'register';

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">{isRegister ? "Create Account" : "Login"}</h2>
            {error && <p className="bg-red-500/20 text-red-400 p-2 rounded mb-4">{error}</p>}
            <form onSubmit={handleAuth} className="space-y-4">
                {isRegister && (<div className="grid grid-cols-2 gap-4">
                    <input name="firstName" placeholder="First Name" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                    <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                </div>)}
                <input name="username" placeholder="Username" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                {isRegister && <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>}
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                {isRegister && <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>}
                <button type="submit" disabled={loading} className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 font-bold disabled:bg-gray-500">{loading ? "Loading..." : (isRegister ? "Register" : "Login")}</button>
                <p className="text-center text-sm text-gray-400">
                    {isRegister ? "Already have an account?" : "No account?"}
                    <button type="button" onClick={() => setAction(isRegister ? 'login' : 'register')} className="text-blue-400 hover:underline ml-1">{isRegister ? 'Login' : 'Create one'}</button>
                </p>
            </form>
        </div>
    );
};

const ProfileSetup = ({ currentUser, onSetupComplete }) => {
    const [profileData, setProfileData] = useState({
        ...currentUser,
        economic_stance: currentUser.economic_stance || 4,
        social_stance: currentUser.social_stance || 4,
        party: currentUser.party || '',
        home_state: currentUser.home_state || '',
        bio: currentUser.bio || ''
    });
    const [error, setError] = useState('');

    const getStanceLabel = (value) => stanceScale.find(s => s.value === parseInt(value, 10))?.label || 'Moderate';

    const calculateStateAlignment = (playerEconomic, playerSocial, stateName) => {
        if (!stateName || !stateData[stateName] || playerEconomic === undefined || playerSocial === undefined) {
            return { economicMatch: 'N/A', socialMatch: 'N/A', overallAlignment: 'N/A' };
        }
        const stateEconomic = stateData[stateName]?.economic || 4;
        const stateSocial = stateData[stateName]?.social || 4;
        const economicDiff = Math.abs(parseInt(playerEconomic, 10) - stateEconomic);
        const socialDiff = Math.abs(parseInt(playerSocial, 10) - stateSocial);
        const economicMatch = Math.max(0, 100 - (economicDiff * 15));
        const socialMatch = Math.max(0, 100 - (socialDiff * 15));
        const overallAlignment = Math.max(0, 100 - ((economicDiff + socialDiff) * 10));
        return { economicMatch, socialMatch, overallAlignment };
    };

    const alignment = calculateStateAlignment(
        profileData.economic_stance, // Already number from state or default
        profileData.social_stance, // Already number from state or default
        profileData.home_state
    );

    const handleUpdate = async (fieldKey, value) => {
        const localStateFieldKey = fieldKey; 
        let apiFieldKey = fieldKey;
        if (fieldKey === 'economic_stance') apiFieldKey = 'economicStance';
        if (fieldKey === 'social_stance') apiFieldKey = 'socialStance';
        if (fieldKey === 'home_state') apiFieldKey = 'homeState';

        const valToUpdate = (localStateFieldKey === 'economic_stance' || localStateFieldKey === 'social_stance') 
                            ? parseInt(value, 10) 
                            : value;
        
        setProfileData(prev => ({ ...prev, [localStateFieldKey]: valToUpdate }));
        
        try {
            setError('');
            await apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify({ [apiFieldKey]: valToUpdate }) });
        } catch (err) {
            setError(`Failed to update ${localStateFieldKey}: ${err.message}`);
        }
    };

    const finishSetup = () => {
        setError('');
        if (!profileData.party || !profileData.home_state) {
            alert("Please select a party and a home state to continue.");
            return;
        }
        onSetupComplete();
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 md:mt-20 p-6 bg-gray-800 rounded-lg space-y-6 shadow-xl">
            <h2 className="text-2xl font-bold text-center text-blue-300">Create Your Political Persona</h2>
            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Political Party</label>
                    <select 
                        value={profileData.party} 
                        onChange={(e) => handleUpdate('party', e.target.value)} 
                        className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select Party</option><option value="Democrat">Democrat</option><option value="Republican">Republican</option><option value="Independent">Independent</option>
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Home State</label>
                    <select 
                        value={profileData.home_state} 
                        onChange={(e) => handleUpdate('home_state', e.target.value)} 
                        className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select State</option>
                        {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Economic Stance: {getStanceLabel(profileData.economic_stance)}</label>
                <input 
                    type="range" min="1" max="7" 
                    value={profileData.economic_stance} 
                    onChange={e => handleUpdate('economic_stance', e.target.value)} 
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>
             <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Social Stance: {getStanceLabel(profileData.social_stance)}</label>
                <input 
                    type="range" min="1" max="7" 
                    value={profileData.social_stance} 
                    onChange={e => handleUpdate('social_stance', e.target.value)} 
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>
            {profileData.home_state && (
                <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
                    <h4 className="text-md font-semibold text-gray-200 mb-2">Alignment with {profileData.home_state}:</h4>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-300">Economic Match: <span className="font-bold text-gray-100">{alignment.economicMatch}%</span></p>
                        <p className="text-gray-300">Social Match: <span className="font-bold text-gray-100">{alignment.socialMatch}%</span></p>
                        <p className="text-gray-200 mt-1">Overall Alignment: <span className="font-bold text-lg text-blue-300">{alignment.overallAlignment}%</span></p>
                    </div>
                </div>
            )}
            <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Bio (Optional)</label>
                <textarea
                    value={profileData.bio}
                    onChange={(e) => handleUpdate('bio', e.target.value)}
                    placeholder="A brief political bio..."
                    className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 h-24 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            <button 
                onClick={finishSetup} 
                disabled={!profileData.party || !profileData.home_state} 
                className="w-full bg-green-600 p-3 rounded font-bold text-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                Enter the Arena
            </button>
        </div>
    );
};

export default App;
