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

// --- REGISTRATION DROPDOWN OPTIONS (from ProfilePage.js, now used in ProfileSetup) ---
const genderOptions = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];
const raceOptions = [
    "White", "Black or African American", "Asian", "American Indian or Alaska Native",
    "Native Hawaiian or Other Pacific Islander", "Hispanic or Latino", "Two or More Races", "Other", "Prefer not to say"
];
const religionOptions = [
    "Christianity", "Judaism", "Islam", "Buddhism", "Hinduism", "Sikhism",
    "Atheist", "Agnostic", "Spiritual but not religious", "None", "Other", "Prefer not to say"
];
const ageOptions = Array.from({ length: (90 - 18) + 1 }, (_, i) => 18 + i);


function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameDate, setGameDate] = useState(null);

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
      console.error("Failed to load profile, logging out.", error);
      localStorage.removeItem('authToken');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);
  
  useEffect(() => {
    if (currentUser) {
      const fetchGameDate = async () => {
        try {
          const dateData = await apiCall('/game/date');
          setGameDate(dateData);
        } catch (error) {
          console.error("Failed to fetch game date:", error);
        }
      };
      fetchGameDate();
      const intervalId = setInterval(fetchGameDate, 60000);
      return () => clearInterval(intervalId);
    } else {
      setGameDate(null);
    }
  }, [currentUser]);

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const handleSuccessfulAuth = () => {
    setLoading(true);
    loadUserProfile(); 
  }
  
  const handleLoginSuccess = () => {
      window.location.href = '/';
  }

  if (loading && !localStorage.getItem('authToken')) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Application...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
        <div className="max-w-7xl mx-auto">
          {currentUser ? (
            <>
              <Navbar currentUser={currentUser} logout={logout} gameDate={gameDate} /> 
              <main className="mt-6">
                <Routes>
                  <Route path="/" element={<HomePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/state/:stateName" element={<StatePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  {/* Pass setCurrentUser to ProfileSetup if it's also responsible for updating the global currentUser state */}
                  <Route path="/profile" element={<ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  <Route path="/profile/:userId" element={<ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </>
          ) : (
            <Routes>
                {/* Pass setCurrentUser to onAuthSuccess and ProfileSetup if needed for global updates */}
                <Route path="*" element={<AuthRouter onAuthSuccess={handleSuccessfulAuth} onLoginSuccess={handleLoginSuccess} setCurrentUser={setCurrentUser} />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

function AuthRouter({ onAuthSuccess, onLoginSuccess, setCurrentUser }) {
    const [authAction, setAuthAction] = useState('login'); 
    const [profileDataForSetup, setProfileDataForSetup] = useState(null);

    if(profileDataForSetup) {
        // Pass setCurrentUser to ProfileSetup
        return <ProfileSetup currentUser={profileDataForSetup} onSetupComplete={onAuthSuccess} setCurrentUser={setCurrentUser} />
    }
    return <AuthScreen action={authAction} setAction={setAuthAction} setProfileDataForSetup={setProfileDataForSetup} onLoginSuccess={onLoginSuccess} />
}

const AuthScreen = ({ action, setAction, setProfileDataForSetup, onLoginSuccess }) => {
    const [form, setForm] = useState({}); // No need for gender, race, etc. defaults here now
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            if (action === 'register' && form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
            
            const response = await apiCall(`/auth/${action}`, { method: 'POST', body: JSON.stringify(form) });
            localStorage.setItem('authToken', response.token);
            
            if (action === 'register') {
                const profile = await apiCall('/auth/profile'); // Fetches initial profile (with name, user_id etc.)
                setProfileDataForSetup(profile); // This profile will be passed to ProfileSetup
            } else { 
                onLoginSuccess();
            }
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const isRegister = action === 'register';

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">{isRegister ? "Create Account" : "Login"}</h2>
            {error && <p className="bg-red-500/20 text-red-400 p-2 rounded mb-4 text-center">{error}</p>}
            <form onSubmit={handleAuth} className="space-y-4">
                {isRegister && (<div className="grid grid-cols-2 gap-4">
                    <input name="firstName" placeholder="First Name" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                    <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                </div>)}
                <input name="username" placeholder="Username" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                {isRegister && <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>}
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>
                {isRegister && <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required className="p-2 bg-gray-700 rounded w-full"/>}
                
                {/* --- GENDER, RACE, RELIGION, AGE FIELDS REMOVED FROM HERE --- */}
                
                <button type="submit" disabled={loading} className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 font-bold disabled:bg-gray-500">{loading ? "Loading..." : (isRegister ? "Register" : "Login")}</button>
                <p className="text-center text-sm text-gray-400">
                    {isRegister ? "Already have an account?" : "No account?"}
                    <button type="button" onClick={() => setAction(isRegister ? 'login' : 'register')} className="text-blue-400 hover:underline ml-1">{isRegister ? 'Login' : 'Create one'}</button>
                </p>
            </form>
        </div>
    );
};

const ProfileSetup = ({ currentUser, onSetupComplete, setCurrentUser }) => {
    const [profileData, setProfileData] = useState({
        ...currentUser,
        economic_stance: currentUser.economic_stance || 4,
        social_stance: currentUser.social_stance || 4,
        party: currentUser.party || '',
        home_state: currentUser.home_state || '',
        bio: currentUser.bio || '',
        // --- NEW FIELDS INITIALIZED HERE ---
        gender: currentUser.gender || '',
        race: currentUser.race || '',
        religion: currentUser.religion || '',
        age: currentUser.age || '',
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
        profileData.economic_stance,
        profileData.social_stance,
        profileData.home_state
    );
    
    const handleUpdate = async (fieldKey, value) => {
        // Make sure to handle age as a number for the API if it's sent
        const valToUpdate = fieldKey === 'age' ? parseInt(value, 10) || null : value;
        
        // Optimistically update local state
        setProfileData(prev => ({ ...prev, [fieldKey]: valToUpdate }));
        
        try {
            setError('');
            // API call to update the profile; backend should handle these fields
            const updatedProfile = await apiCall('/profile', { 
                method: 'PUT', 
                body: JSON.stringify({ [fieldKey]: valToUpdate }) 
            });
            // Update the global currentUser state if setCurrentUser is provided
            if (setCurrentUser && updatedProfile) {
                setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
            }
        } catch (err) {
            setError(`Failed to update ${fieldKey}: ${err.message}`);
            // Optionally revert optimistic update here
        }
    };

    const finishSetup = async () => {
        setError('');
        // Check all required fields, including the new ones
        if (!profileData.party || !profileData.home_state || !profileData.gender || !profileData.race || !profileData.religion || !profileData.age) {
            alert("Please select your party, home state, and complete all biographical fields (Gender, Age, Race, Religion) to continue.");
            return;
        }
        // All changes are already sent via handleUpdate,
        // so onSetupComplete can just proceed.
        onSetupComplete();
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 md:mt-20 p-6 bg-gray-800 rounded-lg space-y-6 shadow-xl">
            <h2 className="text-2xl font-bold text-center text-blue-300">Create Your Political Persona</h2>
            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm">{error}</p>}
            
            {/* Existing Party and Home State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Political Party</label>
                    <select value={profileData.party} onChange={(e) => handleUpdate('party', e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Party</option><option value="Democrat">Democrat</option><option value="Republican">Republican</option><option value="Independent">Independent</option>
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Home State</label>
                    <select value={profileData.home_state} onChange={(e) => handleUpdate('home_state', e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select State</option>
                        {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* --- NEW DROPDOWN FIELDS ADDED HERE --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Gender</label>
                    <select name="gender" value={profileData.gender} onChange={(e) => handleUpdate('gender', e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Gender</option>
                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Age</label>
                    <select name="age" value={profileData.age} onChange={(e) => handleUpdate('age', e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Age</option>
                        {ageOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>
             <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Race/Ethnicity</label>
                <select name="race" value={profileData.race} onChange={(e) => handleUpdate('race', e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Select Race/Ethnicity</option>
                    {raceOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Religion</label>
                <select name="religion" value={profileData.religion} onChange={(e) => handleUpdate('religion', e.target.value)} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Select Religion</option>
                    {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Existing Stances, Bio, etc. */}
            <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Economic Stance: {getStanceLabel(profileData.economic_stance)}</label>
                <input type="range" min="1" max="7" value={profileData.economic_stance} onChange={e => handleUpdate('economic_stance', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
            </div>
             <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Social Stance: {getStanceLabel(profileData.social_stance)}</label>
                <input type="range" min="1" max="7" value={profileData.social_stance} onChange={e => handleUpdate('social_stance', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
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
                <textarea value={profileData.bio} onChange={(e) => handleUpdate('bio', e.target.value)} placeholder="A brief political bio..." className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 h-24 focus:border-blue-500 focus:ring-blue-500"/>
            </div>
            <button 
                onClick={finishSetup} 
                disabled={!profileData.party || !profileData.home_state || !profileData.gender || !profileData.race || !profileData.religion || !profileData.age} 
                className="w-full bg-green-600 p-3 rounded font-bold text-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                Enter the Arena
            </button>
        </div>
    );
};

export default App;
