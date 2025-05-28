// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../api';
import { stanceScale, allStates, stateData as allStateData } from '../state-data';
import { Edit3, Save, User, MapPin, DollarSign, TrendingUp, Briefcase, Shield, Award, Info, Mail, Hash, Copy, Check } from 'lucide-react';

// Helper to get stance label
const getStanceLabel = (value) => stanceScale.find(s => s.value === parseInt(value, 10))?.label || 'Moderate';

// Helper to calculate alignment
const calculateStateAlignment = (playerEconomic, playerSocial, stateName) => {
    if (!stateName || !allStateData[stateName] || playerEconomic === undefined || playerSocial === undefined) {
        return { economicMatch: 'N/A', socialMatch: 'N/A', overallAlignment: 'N/A' };
    }
    const stateEconomic = allStateData[stateName]?.economic || 4;
    const stateSocial = allStateData[stateName]?.social || 4;
    const economicDiff = Math.abs(parseInt(playerEconomic, 10) - stateEconomic);
    const socialDiff = Math.abs(parseInt(playerSocial, 10) - stateSocial);
    const economicMatch = Math.max(0, 100 - (economicDiff * 15));
    const socialMatch = Math.max(0, 100 - (socialDiff * 15));
    const overallAlignment = Math.max(0, 100 - ((economicDiff + socialDiff) * 10));
    return { economicMatch, socialMatch, overallAlignment };
};


export default function ProfilePage({ currentUser, setCurrentUser }) {
    const { userId: paramsUserId } = useParams();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editableFields, setEditableFields] = useState({});
    const [justCopied, setJustCopied] = useState(false);
    const [alignment, setAlignment] = useState({ economicMatch: 'N/A', socialMatch: 'N/A', overallAlignment: 'N/A' });

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError('');

        // If there's no currentUser prop, we can't do anything. Redirect to login.
        if (!currentUser) {
            navigate('/login'); // Or your main auth page
            return;
        }

        try {
            const targetUserId = paramsUserId || currentUser.id;
            const viewingOwnProfile = targetUserId === currentUser.id;
            setIsOwnProfile(viewingOwnProfile);

            const data = viewingOwnProfile ? currentUser : await apiCall(`/profiles/${targetUserId}`);
            setProfileData(data);
            
            if (viewingOwnProfile) {
                setEditableFields({
                    firstName: data.first_name || '', lastName: data.last_name || '',
                    party: data.party || '', home_state: data.home_state || '',
                    economic_stance: data.economic_stance || 4, social_stance: data.social_stance || 4,
                    bio: data.bio || '', gender: data.gender || '',
                    race: data.race || '', religion: data.religion || '',
                    age: data.age || '',
                });
            }
            
            if (data.home_state) {
                setAlignment(calculateStateAlignment(data.economic_stance, data.social_stance, data.home_state));
            }

        } catch (err) {
            setError(`Failed to load profile: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [paramsUserId, currentUser, navigate]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableFields(prev => ({ ...prev, [name]: value }));
    };
    
    const handleStanceChange = (name, value) => {
        setEditableFields(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    };

    const handleSaveChanges = async () => {
        setError('');
        if (!editableFields.party || !editableFields.home_state) {
            setError("Party and Home State are required.");
            return;
        }
        try {
            const payload = {
                firstName: editableFields.firstName, lastName: editableFields.lastName,
                party: editableFields.party, homeState: editableFields.home_state,
                economicStance: parseInt(editableFields.economic_stance, 10), socialStance: parseInt(editableFields.social_stance, 10),
                bio: editableFields.bio, gender: editableFields.gender, race: editableFields.race,
                religion: editableFields.religion, age: editableFields.age ? parseInt(editableFields.age, 10) : null,
            };
            const { updatedProfile } = await apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
            setProfileData(updatedProfile);
            if (setCurrentUser) setCurrentUser(updatedProfile);
            setEditMode(false);
        } catch (err) {
            setError(`Failed to save changes: ${err.message}`);
        }
    };
    
    const copyProfileLink = () => {
        const link = `${window.location.origin}/profile/${profileData.id}`;
        navigator.clipboard.writeText(link).then(() => {
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        });
    };
    
    const renderGubernatorialHistory = (history) => {
        if (!history || typeof history !== 'object' || Object.keys(history).length === 0) {
            return <p className="text-sm text-gray-500">No gubernatorial history.</p>;
        }
        return (
            <ul className="space-y-2">
                {Object.entries(history).map(([state, data]) => (
                    <li key={state} className="text-sm">
                        <strong className="text-gray-300">{state}:</strong> {data.terms_served} term(s) served.
                        {data.previous_terms && data.previous_terms.length > 0 && (
                            <ul className="list-disc list-inside pl-4 text-xs text-gray-400">
                                {data.previous_terms.map((term, i) => <li key={i}>{term.start_year} - {term.end_year}</li>)}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading profile...</div>;
    if (error) return <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>;
    if (!profileData) return <div className="text-center py-10 text-gray-400">Profile not found.</div>;

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl max-w-4xl mx-auto">
            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm mb-4">{error}</p>}
            
            {isOwnProfile && (
                <div className="mb-4 bg-gray-900/50 p-3 rounded-lg">
                    <label className="text-xs text-gray-400">Your Shareable Profile Link</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input type="text" readOnly value={`${window.location.origin}/profile/${profileData.id}`} className="w-full bg-gray-700 text-gray-300 p-1 rounded-md text-sm border-gray-600"/>
                        <button onClick={copyProfileLink} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center shrink-0">
                            {justCopied ? <Check size={16} className="mr-1.5"/> : <Copy size={16} className="mr-1.5"/>}
                            {justCopied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-blue-300">
                    {profileData.first_name} {profileData.last_name}
                    <span className="text-lg text-gray-400 ml-2">(@{profileData.username})</span>
                </h2>
                
                {isOwnProfile && (
                    <div>
                        {editMode ? (
                            <div className="flex gap-2">
                                <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"><Save size={16} className="mr-2"/> Save</button>
                                <button onClick={() => setEditMode(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm">Cancel</button>
                            </div>
                        ) : (
                            <button onClick={() => setEditMode(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"><Edit3 size={16} className="mr-2"/> Edit Profile</button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <InfoCard title="Personal Information" icon={<User size={18}/>}>
                        {isOwnProfile && editMode ? (
                            <>
                                <EditableField label="First Name" name="firstName" value={editableFields.firstName} onChange={handleInputChange} />
                                <EditableField label="Last Name" name="lastName" value={editableFields.lastName} onChange={handleInputChange} />
                            </>
                        ) : ( <ReadOnlyField label="Name" value={`${profileData.first_name} ${profileData.last_name}`} /> )}
                        {isOwnProfile && <ReadOnlyField label="Email" value={profileData.email} icon={<Mail size={14}/>} />}
                        <ReadOnlyField label="Username" value={`@${profileData.username}`} icon={<Hash size={14}/>} />
                        {isOwnProfile && editMode ? (
                            <>
                                <EditableField label="Age" name="age" type="number" value={editableFields.age} onChange={handleInputChange} placeholder="Optional"/>
                                <EditableField label="Gender" name="gender" value={editableFields.gender} onChange={handleInputChange} placeholder="Optional" />
                                <EditableField label="Race/Ethnicity" name="race" value={editableFields.race} onChange={handleInputChange} placeholder="Optional" />
                                <EditableField label="Religion" name="religion" value={editableFields.religion} onChange={handleInputChange} placeholder="Optional" />
                            </>
                        ) : (
                            <>
                                {profileData.age && <ReadOnlyField label="Age" value={profileData.age} />}
                                {profileData.gender && <ReadOnlyField label="Gender" value={profileData.gender} />}
                                {profileData.race && <ReadOnlyField label="Race/Ethnicity" value={profileData.race} />}
                                {profileData.religion && <ReadOnlyField label="Religion" value={profileData.religion} />}
                            </>
                        )}
                    </InfoCard>
                    <InfoCard title="Political Stats" icon={<TrendingUp size={18}/>}>
                        <ReadOnlyField label="Approval Rating" value={`${profileData.approval_rating}%`} />
                        <ReadOnlyField label="Campaign Funds" value={`$${profileData.campaign_funds?.toLocaleString()}`} icon={<DollarSign size={14}/>}/>
                        <ReadOnlyField label="Political Capital" value={profileData.political_capital} icon={<Briefcase size={14}/>}/>
                        <ReadOnlyField label="Action Points" value={profileData.action_points} />
                        <ReadOnlyField label="State Name Recognition" value={`${profileData.state_name_recognition}%`} />
                        <ReadOnlyField label="Campaign Strength" value={`${profileData.campaign_strength}%`} />
                    </InfoCard>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <InfoCard title="Political Identity" icon={<Shield size={18}/>}>
                        {isOwnProfile && editMode ? (
                            <>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Party</label>
                                <select name="party" value={editableFields.party} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 mb-2">
                                    <option value="">Select Party</option><option value="Democrat">Democrat</option><option value="Republican">Republican</option><option value="Independent">Independent</option>
                                </select>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Home State</label>
                                <select name="home_state" value={editableFields.home_state} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 mb-3">
                                    <option value="">Select State</option>
                                    {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Economic Stance: {getStanceLabel(editableFields.economic_stance)}</label>
                                    <input type="range" min="1" max="7" name="economic_stance" value={editableFields.economic_stance} onChange={(e) => handleStanceChange('economic_stance', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Social Stance: {getStanceLabel(editableFields.social_stance)}</label>
                                    <input type="range" min="1" max="7" name="social_stance" value={editableFields.social_stance} onChange={(e) => handleStanceChange('social_stance', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                                </div>
                            </>
                        ) : (
                            <>
                                <ReadOnlyField label="Party" value={profileData.party || 'N/A'} />
                                <ReadOnlyField label="Home State" value={profileData.home_state || 'N/A'} icon={<MapPin size={14}/>}/>
                                <ReadOnlyField label="Economic Stance" value={getStanceLabel(profileData.economic_stance)} />
                                <ReadOnlyField label="Social Stance" value={getStanceLabel(profileData.social_stance)} />
                            </>
                        )}
                        { ( (isOwnProfile && editMode && editableFields.home_state) || (!editMode && profileData.home_state) ) && (
                            <div className="bg-gray-700/50 p-3 rounded-md mt-3">
                                <h4 className="text-xs font-semibold text-gray-200 mb-1">Alignment with {isOwnProfile && editMode ? editableFields.home_state : profileData.home_state}:</h4>
                                <p className="text-xs text-gray-300">Economic Match: <span className="font-bold text-gray-100">{alignment.economicMatch}%</span></p>
                                <p className="text-xs text-gray-300">Social Match: <span className="font-bold text-gray-100">{alignment.socialMatch}%</span></p>
                                <p className="text-xs text-gray-200 mt-0.5">Overall: <span className="font-bold text-blue-300">{alignment.overallAlignment}%</span></p>
                            </div>
                        )}
                    </InfoCard>
                    <InfoCard title="Biography" icon={<Info size={18}/>}>
                        {isOwn_profile && editMode ? (
                            <textarea name="bio" value={editableFields.bio} onChange={handleInputChange} placeholder="Your political background, goals, and vision..." className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 h-28 text-sm"></textarea>
                        ) : ( <p className="text-sm text-gray-300 whitespace-pre-wrap">{profileData.bio || <span className="text-gray-500">No bio provided.</span>}</p> )}
                    </InfoCard>
                    <InfoCard title="Political Career" icon={<Award size={18}/>}>
                         <ReadOnlyField label="Current Office" value={profileData.current_office || 'Citizen'} />
                         <ReadOnlyField label="Elections Won" value={profileData.elections_won || 0} />
                         <ReadOnlyField label="Elections Lost" value={profileData.elections_lost || 0} />
                         <ReadOnlyField label="Total Votes Received" value={profileData.total_votes_received?.toLocaleString() || 0} />
                         <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-200 mb-1">Gubernatorial History:</h4>
                            {renderGubernatorialHistory(profileData.gubernatorial_history)}
                         </div>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
}

const InfoCard = ({ title, icon, children }) => ( <div className="bg-gray-700/50 p-4 rounded-lg shadow-lg"> <h3 className="text-lg font-semibold text-blue-200 mb-3 flex items-center border-b border-gray-600 pb-2"> {icon && React.cloneElement(icon, { className: "mr-2" })} {title} </h3> <div className="space-y-2">{children}</div> </div> );
const ReadOnlyField = ({ label, value, icon }) => ( <div> <span className="text-xs text-gray-400 block">{label}</span> <p className="text-sm text-gray-200 flex items-center"> {icon && React.cloneElement(icon, { className: "mr-1.5 text-gray-400" })} {value} </p> </div> );
const EditableField = ({ label, name, value, onChange, type = "text", placeholder }) => ( <div className="mb-2"> <label htmlFor={name} className="block text-xs font-medium text-gray-300 mb-0.5">{label}</label> <input type={type} name={name} id={name} value={value || ''} onChange={onChange} placeholder={placeholder || label} className="w-full p-1.5 bg-gray-600 rounded text-white border border-gray-500 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" /> </div> );
