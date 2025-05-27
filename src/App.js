// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiCall } from './api';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import { allStates, stateData, stanceScale } from './state-data';
import StatePage from './pages/StatePage'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function loads the user's profile if a token exists
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
      // If profile fails, token is invalid, so log out
      localStorage.removeItem('authToken');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on initial application load
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);
  
  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const handleSuccessfulAuth = () => {
    setLoading(true);
    loadUserProfile();
  }

  // Show a global loading screen until we know if the user is logged in or not
  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Application...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
        <div className="max-w-7xl mx-auto">
          {currentUser ? (
            // If user is logged in, show the main app with Navbar and page routes
            <>
              <Navbar currentUser={currentUser} logout={logout} />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/state/:stateName" element={<StatePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/" />} /> {/* Redirect unknown paths */}
                </Routes>
              </main>
            </>
          ) : (
            // If user is not logged in, show the authentication flow
            <Routes>
                <Route path="*" element={<AuthRouter onAuthSuccess={handleSuccessfulAuth} />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

// A mini-router component to handle the Login, Register, and Profile Setup flow for new users
function AuthRouter({ onAuthSuccess }) {
    const [authAction, setAuthAction] = useState('login'); // Can be 'login' or 'register'
    const [profileDataForSetup, setProfileDataForSetup] = useState(null);

    // After registration, the API returns a token. We then fetch the new profile and show this setup screen.
    if(profileDataForSetup) {
        return <ProfileSetup currentUser={profileDataForSetup} onSetupComplete={onAuthSuccess} />
    }

    // Default view is to show the Login or Register screen
    return <AuthScreen action={authAction} setAction={setAuthAction} setProfileDataForSetup={setProfileDataForSetup} onAuthSuccess={onAuthSuccess} />
}

const AuthScreen = ({ action, setAction, setProfileDataForSetup, onAuthSuccess }) => {
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
                const profile = await apiCall('/auth/profile');
                setProfileDataForSetup(profile);
            } else { // On successful login
                onAuthSuccess();
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
        // Ensure other fields that might be null on a new profile have defaults if needed by inputs
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

    // Ensure profileData values are numbers before calculating alignment
    const alignment = calculateStateAlignment(
        parseInt(profileData.economic_stance, 10),
        parseInt(profileData.social_stance, 10),
        profileData.home_state
    );

    const handleUpdate = async (fieldKey, value) => {
        // This is the key in profileData state (e.g., 'economic_stance', 'home_state')
        const localStateFieldKey = fieldKey; 
        
        // This is the key expected by the backend API (e.g., 'economicStance', 'homeState')
        // We'll map them if they are different, otherwise use the same.
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
            // Use the apiFieldKey for the body sent to the backend
            await apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify({ [apiFieldKey]: valToUpdate }) });
        } catch (err) {
            setError(`Failed to update ${localStateFieldKey}: ${err.message}`);
            // Optional: Revert local state if API call fails
            // setProfileData(prev => ({ ...prev, [localStateFieldKey]: currentUser[localStateFieldKey] || ( (localStateFieldKey === 'economic_stance' || localStateFieldKey === 'social_stance') ? 4 : '' ) }));
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
                        <option value="">Select Party</option>
                        <option value="Democrat">Democrat</option>
                        <option value="Republican">Republican</option>
                        <option value="Independent">Independent</option>
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
