// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { apiCall } from './api';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PolicyAgreementModal from './components/PolicyAgreementModal';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import PartyPage from './pages/PartyPage';
import AllPartiesPage from './pages/AllPartiesPage';
import CampaignHQPage from './pages/CampaignHQPage';
import NotificationsPage from './pages/NotificationsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { allStates, stateData, stanceScale } from './state-data';
import StatePage from './pages/StatePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NotificationPreviewManager from './components/NotificationPreview';

// --- REGISTRATION DROPDOWN OPTIONS ---
const genderOptions = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];
const raceOptions = [
    "White", "Black or African American", "Asian", "American Indian or Alaska Native",
    "Native Hawaiian or Other Pacific Islander", "Hispanic or Latino", "Two or More Races", "Other", "Prefer not to say"
];
const religionOptions = [
    "Christianity", "Judaism", "Islam", "Buddhism", "Hinduism", "Sikhism",
    "Atheist", "Agnostic", "Spiritual but not religious", "None", "Other", "Prefer not to say"
];
const ageOptions = Array.from({ length: (120 - 18) + 1 }, (_, i) => 18 + i); // Adjusted max age

function AppContent() {
  const { user: currentUser, loading, logout } = useAuth();
  const { showError } = useNotification();
  const [gameDate, setGameDate] = useState(null);

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

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Application...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
        <div className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            {currentUser ? (
              <>
                <Navbar currentUser={currentUser} logout={logout} gameDate={gameDate} /> 
                <main className="mt-6">
                  <Routes>
                    <Route path="/" element={<HomePage currentUser={currentUser} />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/state/:stateName" element={<StatePage currentUser={currentUser} />} />
                    <Route path="/profile" element={<ProfilePage currentUser={currentUser} />} />
                    <Route path="/profile/:userId" element={<ProfilePage currentUser={currentUser} />} />
                    <Route path="/party" element={<PartyPage currentUser={currentUser} />} />
                    <Route path="/party/:partyId" element={<PartyPage currentUser={currentUser} />} />
                    <Route path="/parties" element={<AllPartiesPage />} />
                    <Route path="/campaign-hq" element={<CampaignHQPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
                
                {/* Notification Preview Manager for bottom-right popups */}
                <NotificationPreviewManager currentUser={currentUser} />
              </>
            ) : (
              <>
                <Routes>
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="*" element={<AuthRouter />} />
                </Routes>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

function AuthRouter() {
    const [authAction, setAuthAction] = useState('login'); 
    const [profileDataForSetup, setProfileDataForSetup] = useState(null);
    const { setUser } = useAuth();

    const handleRegistrationSuccess = (initialProfile) => {
        setProfileDataForSetup(initialProfile);
    };

    const handleSetupComplete = (updatedProfile) => {
        setUser(updatedProfile);
        setProfileDataForSetup(null); // Clear the setup state
    };

    if(profileDataForSetup) {
        return <ProfileSetup currentUserData={profileDataForSetup} onSetupComplete={handleSetupComplete} />
    }
    return <AuthScreen action={authAction} setAction={setAuthAction} onRegistrationSuccess={handleRegistrationSuccess} />
}

const AuthScreen = ({ action, setAction, onRegistrationSuccess }) => {
    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [policiesAccepted, setPoliciesAccepted] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault(); 
        setLoading(true); 
        setError('');
        
        try {
            if (action === 'register') {
                if (form.password !== form.confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                if (!policiesAccepted) {
                    throw new Error("You must accept both the Privacy Policy and Terms of Service to register.");
                }
            }
            
            const response = await apiCall(`/auth/${action}`, { method: 'POST', body: JSON.stringify(form) });
            localStorage.setItem('authToken', response.token);
            
            if (action === 'register') {
                // After successful registration, fetch the initial profile to pass to ProfileSetup
                const initialProfile = await apiCall('/auth/profile');
                onRegistrationSuccess(initialProfile); // Pass this to AuthRouter
            }
        } catch (err) { 
            setError(err.message); 
        } 
        finally { 
            setLoading(false); 
        }
    }

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const isRegister = action === 'register';

    const handlePolicyAgreement = (agreed) => {
        setPoliciesAccepted(agreed);
    };

    return (
        <>
            <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-300">
                    {isRegister ? "Create Your Politician Character" : "Login"}
                </h2>
                
                {/* Registration Disclaimer */}
                {isRegister && (
                    <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                        <h3 className="text-yellow-300 font-semibold mb-2 flex items-center">
                            <span className="mr-2">⚠️</span>
                            Create a Fictional Politician
                        </h3>
                        <div className="text-yellow-200 text-sm space-y-1">
                            <p>• <strong>DO NOT</strong> use your real name or personal information</p>
                            <p>• Create a <strong>fictional politician character</strong> for this game</p>
                            <p>• Your username will be auto-generated as: <span className="font-mono">FirstName.LastName</span></p>
                            <p>• Use realistic politician names (letters, spaces, hyphens, apostrophes only)</p>
                        </div>
                    </div>
                )}

                {error && <p className="bg-red-500/20 text-red-400 p-2 rounded mb-4 text-center">{error}</p>}
                <form onSubmit={handleAuth} className="space-y-4">
                    {isRegister && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Politician First Name *
                                </label>
                                <input 
                                    name="firstName" 
                                    placeholder="e.g., John" 
                                    onChange={handleChange} 
                                    required 
                                    className="p-2 bg-gray-700 rounded w-full border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    pattern="[a-zA-ZÀ-ÿĀ-žА-я\s\-'.]+"
                                    title="Only letters, spaces, hyphens, apostrophes, and periods allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Politician Last Name *
                                </label>
                                <input 
                                    name="lastName" 
                                    placeholder="e.g., Smith" 
                                    onChange={handleChange} 
                                    required 
                                    className="p-2 bg-gray-700 rounded w-full border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    pattern="[a-zA-ZÀ-ÿĀ-žА-я\s\-'.]+"
                                    title="Only letters, spaces, hyphens, apostrophes, and periods allowed"
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Email field for both login and registration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Email Address *
                        </label>
                        <input 
                            name="email" 
                            type="email" 
                            placeholder="your.email@example.com" 
                            onChange={handleChange} 
                            required 
                            className="p-2 bg-gray-700 rounded w-full border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input 
                            name="password" 
                            type="password" 
                            placeholder="Password" 
                            onChange={handleChange} 
                            required 
                            className="p-2 bg-gray-700 rounded w-full border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    
                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <input 
                                name="confirmPassword" 
                                type="password" 
                                placeholder="Confirm Password" 
                                onChange={handleChange} 
                                required 
                                className="p-2 bg-gray-700 rounded w-full border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Legal Agreement Button for Registration */}
                    {isRegister && (
                        <div className="pt-2">
                            {!policiesAccepted ? (
                                <button
                                    type="button"
                                    onClick={() => setShowPolicyModal(true)}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                                >
                                    Review & Agree to Legal Policies
                                </button>
                            ) : (
                                <div className="w-full px-4 py-3 bg-gray-600 text-gray-300 rounded-md font-medium text-center flex items-center justify-center space-x-2">
                                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Agreed to Privacy Policy & Terms of Service</span>
                                </div>
                            )}
                            {!policiesAccepted && (
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    <span className="text-red-400">*</span> Required to create an account
                                </p>
                            )}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={loading || (isRegister && !policiesAccepted)} 
                        className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 font-bold disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Loading..." : (isRegister ? "Create Politician" : "Login")}
                    </button>
                    <p className="text-center text-sm text-gray-400">
                        {isRegister ? "Already have an account?" : "No account?"}
                        <button type="button" onClick={() => setAction(isRegister ? 'login' : 'register')} className="text-blue-400 hover:underline ml-1">{isRegister ? 'Login' : 'Create one'}</button>
                    </p>
                </form>
            </div>

            <PolicyAgreementModal
                isOpen={showPolicyModal}
                onClose={() => setShowPolicyModal(false)}
                onAgreementComplete={handlePolicyAgreement}
            />
        </>
    );
};

const ProfileSetup = ({ currentUserData, onSetupComplete }) => {
    const [profileData, setProfileData] = useState({
        party: currentUserData.party || '',
        home_state: currentUserData.home_state || '',
        economic_stance: currentUserData.economic_stance || 4,
        social_stance: currentUserData.social_stance || 4,
        bio: currentUserData.bio || '',
        gender: currentUserData.gender || '',
        race: currentUserData.race || '',
        religion: currentUserData.religion || '',
        age: currentUserData.age || '',
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);


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
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const finishSetup = async () => {
        setError('');
        if (!profileData.party || !profileData.home_state || !profileData.gender || !profileData.race || !profileData.religion || !profileData.age) {
            setError("Please complete all required fields: Party, Home State, Gender, Age, Race, and Religion.");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                party: profileData.party,
                homeState: profileData.home_state,
                economicStance: parseInt(profileData.economic_stance, 10),
                socialStance: parseInt(profileData.social_stance, 10),
                bio: profileData.bio,
                gender: profileData.gender,
                race: profileData.race,
                religion: profileData.religion,
                age: parseInt(profileData.age, 10),
            };
            // The API call returns an object like { message: "...", updatedProfile: { ... } }
            const response = await apiCall('/profile', { // This calls PUT /api/profile
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            // --- FIX: Access the nested updatedProfile object ---
            if (response && response.updatedProfile) {
                console.log("App.js - ProfileSetup - Calling onSetupComplete with:", response.updatedProfile);
                onSetupComplete(response.updatedProfile);
            } else if (!response || !response.updatedProfile) {
                // If the structure is not as expected, log an error.
                // This can happen if the backend PUT /api/profile route doesn't return { updatedProfile: ... }
                console.error("ProfileSetup Error: PUT /api/profile did not return expected 'updatedProfile' object.", response);
                setError("Failed to update profile data correctly. Please try again or contact support.");
                setIsSaving(false);
                return; // Prevent calling onSetupComplete if data is bad
            }
        } catch (err) {
            setError(`Failed to save profile: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // JSX for ProfileSetup remains the same as the last version you provided
    return (
        <div className="max-w-2xl mx-auto mt-10 md:mt-20 p-6 bg-gray-800 rounded-lg space-y-6 shadow-xl">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-blue-300">Create Your Political Persona</h2>
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                    <p className="text-blue-200 text-sm">
                        <span className="font-semibold">Remember:</span> You are customizing your <strong>fictional politician character</strong> - 
                        this information represents your in-game persona, not your real identity.
                    </p>
                </div>
            </div>
            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm text-center">{error}</p>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Political Party *</label>
                    <select name="party" value={profileData.party} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Party</option><option value="Democrat">Democrat</option><option value="Republican">Republican</option><option value="Independent">Independent</option>
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Home State *</label>
                    <select name="home_state" value={profileData.home_state} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select State</option>
                        {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Gender *</label>
                    <select name="gender" value={profileData.gender} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Gender</option>
                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-bold text-gray-300">Age *</label>
                    <select name="age" value={profileData.age} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select Age</option>
                        {ageOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>
             <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Race/Ethnicity *</label>
                <select name="race" value={profileData.race} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Select Race/Ethnicity</option>
                    {raceOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Religion *</label>
                <select name="religion" value={profileData.religion} onChange={handleChange} required className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Select Religion</option>
                    {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Economic Stance: {getStanceLabel(profileData.economic_stance)}</label>
                <input type="range" name="economic_stance" min="1" max="7" value={profileData.economic_stance} onChange={handleChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
            </div>
             <div>
                <label className="block mb-1 text-sm font-bold text-gray-300">Social Stance: {getStanceLabel(profileData.social_stance)}</label>
                <input type="range" name="social_stance" min="1" max="7" value={profileData.social_stance} onChange={handleChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
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
                <textarea name="bio" value={profileData.bio} onChange={handleChange} placeholder="A brief political bio..." className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 h-24 focus:border-blue-500 focus:ring-blue-500"/>
            </div>
            <button 
                onClick={finishSetup} 
                disabled={isSaving || !profileData.party || !profileData.home_state || !profileData.gender || !profileData.race || !profileData.religion || !profileData.age} 
                className="w-full bg-green-600 p-3 rounded font-bold text-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                {isSaving ? "Saving..." : "Enter the Arena"}
            </button>
        </div>
    );
};

export default App;
