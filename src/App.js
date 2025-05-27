// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiCall } from './api';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import { allStates } from './state-data';

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
    const [profileData, setProfileData] = useState(currentUser);
    const stanceScale = [{ value: 1, label: 'Far Left' }, { value: 2, label: 'Left' }, { value: 3, label: 'Center-Left' }, { value: 4, label: 'Moderate' }, { value: 5, label: 'Center-Right' }, { value: 6, label: 'Right' }, { value: 7, label: 'Far Right' }];
    const getStanceLabel = (value) => stanceScale.find(s => s.value === value)?.label || 'Moderate';

    const handleUpdate = async (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
        await apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify({ [field]: value }) });
    }

    const finishSetup = () => {
        if (!profileData.party || !profileData.home_state) {
            alert("Please select a party and a home state to continue.");
            return;
        }
        onSetupComplete();
    }

    return(
        <div className="max-w-2xl mx-auto mt-20 p-6 bg-gray-800 rounded-lg space-y-6">
            <h2 className="text-2xl font-bold">Create Your Political Persona</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-bold">Political Party</label>
                    <select value={profileData.party || ''} onChange={(e) => handleUpdate('party', e.target.value)} className="w-full p-2 bg-gray-700 rounded">
                        <option value="">Select Party</option><option value="Democrat">Democrat</option><option value="Republican">Republican</option><option value="Independent">Independent</option>
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-bold">Home State</label>
                    <select value={profileData.home_state || ''} onChange={(e) => handleUpdate('homeState', e.target.value)} className="w-full p-2 bg-gray-700 rounded">
                        <option value="">Select State</option>
                        {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 text-sm font-bold">Economic Stance: {getStanceLabel(profileData.economic_stance)}</label>
                <input type="range" min="1" max="7" value={profileData.economic_stance || 4} onChange={e => handleUpdate('economicStance', parseInt(e.target.value))} className="w-full"/>
            </div>
             <div>
                <label className="block mb-1 text-sm font-bold">Social Stance: {getStanceLabel(profileData.social_stance)}</label>
                <input type="range" min="1" max="7" value={profileData.social_stance || 4} onChange={e => handleUpdate('socialStance', parseInt(e.target.value))} className="w-full"/>
            </div>
            <button onClick={finishSetup} className="w-full bg-green-600 p-2 rounded font-bold hover:bg-green-700 disabled:bg-gray-500">Enter the Arena</button>
        </div>
    )
}

export default App;