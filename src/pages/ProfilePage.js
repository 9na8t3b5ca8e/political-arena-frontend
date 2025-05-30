// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../api';
import { stanceScale, allStates, stateData as allStateData } from '../state-data';
import {
    Edit3, Save, User, MapPin, DollarSign, TrendingUp, Briefcase, Shield, Award, Info, Mail,
    Copy,
    Check, AlertTriangle, Lock, Settings as SettingsIcon, UploadCloud,
    Trash2, UserCircle2, Building2, Users, Calendar, Edit2, Eye
} from 'lucide-react';
import SettingsModal from '../components/SettingsModal';
import ActiveCampaignsCard from '../components/ActiveCampaignsCard';
import CandidateFinanceWidget from '../components/CandidateFinanceWidget';
import { formatPercentage } from '../utils/formatters';
import EditableField from '../components/EditableField';
import ReadOnlyField from '../components/ReadOnlyField';

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

// Dropdown options
const ageOptions = Array.from({ length: (90 - 18) + 1 }, (_, i) => 18 + i);
const genderOptions = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];
const raceOptions = [
    "White", "Black or African American", "Asian", "American Indian or Alaska Native",
    "Native Hawaiian or Other Pacific Islander", "Hispanic or Latino", "Two or More Races", "Other", "Prefer not to say"
];
const religionOptions = [
    "Christianity", "Judaism", "Islam", "Buddhism", "Hinduism", "Sikhism",
    "Atheist", "Agnostic", "Spiritual but not religious", "None", "Other", "Prefer not to say"
];
const NAME_CHANGE_COOLDOWN_DAYS = 7;
const STANCE_CHANGE_PC_PER_POSITION = 5;

export default function ProfilePage({ currentUser, setCurrentUser }) {
    console.log("ProfilePage: Received currentUser prop:", currentUser);
    const { userId: paramsUserId } = useParams();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editableFields, setEditableFields] = useState({});
    const [justCopied, setJustCopied] = useState(false);
    const [alignment, setAlignment] = useState({ economicMatch: 'N/A', socialMatch: 'N/A', overallAlignment: 'N/A' });
    const [bioCharCount, setBioCharCount] = useState(0);
    const [isNameChangeCooldownActive, setIsNameChangeCooldownActive] = useState(false);
    const [nextNameChangeDate, setNextNameChangeDate] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [econStancePCCost, setEconStancePCCost] = useState(0);
    const [socialStancePCCost, setSocialStancePCCost] = useState(0);
    const [selectedProfilePictureFile, setSelectedProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);


    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const initializeEditableFields = useCallback((data) => {
        if (data) {
            const newEditableFields = {
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                username: data.username || '',
                // email: data.email || '', // Email is no longer directly edited here
                party: data.party || '',
                home_state: data.home_state || '',
                economic_stance: parseInt(data.economic_stance, 10) || 4,
                social_stance: parseInt(data.social_stance, 10) || 4,
                bio: data.bio || '',
                gender: data.gender || '',
                race: data.race || '',
                religion: data.religion || '',
                age: data.age || '',
                profile_picture_url: data.profile_picture_url || null,
            };
            setEditableFields(newEditableFields);
            setBioCharCount(data.bio?.length || 0);
            setProfilePicturePreview(data.profile_picture_url || null);

            if (profileData) {
                 setEconStancePCCost(Math.abs(newEditableFields.economic_stance - profileData.economic_stance) * STANCE_CHANGE_PC_PER_POSITION);
                 setSocialStancePCCost(Math.abs(newEditableFields.social_stance - profileData.social_stance) * STANCE_CHANGE_PC_PER_POSITION);
            } else {
                setEconStancePCCost(0);
                setSocialStancePCCost(0);
            }
        }
    }, [profileData]);


    const loadProfile = useCallback(async () => {
        setLoading(true);
        clearMessages();

        if (!currentUser) {
            console.log("ProfilePage - loadProfile: currentUser is null, navigating away.");
            navigate('/');
            return;
        }

        try {
            const targetUserId = paramsUserId ? parseInt(paramsUserId, 10) : currentUser.id;
            const viewingOwnProfile = targetUserId === currentUser.id;

            setIsOwnProfile(viewingOwnProfile);

            const data = viewingOwnProfile ? currentUser : await apiCall(`/profiles/${targetUserId}`);
            console.log("ProfilePage - loadProfile: Setting profileData to:", data);
            setProfileData(data);

            if (data && data.home_state && data.economic_stance !== undefined && data.social_stance !== undefined) {
                setAlignment(calculateStateAlignment(data.economic_stance, data.social_stance, data.home_state));
            } else {
                 setAlignment({ economicMatch: 'N/A', socialMatch: 'N/A', overallAlignment: 'N/A' });
            }

            if (viewingOwnProfile && data && data.last_name_change_date) {
                const lastChange = new Date(data.last_name_change_date);
                let cooldownEnds = new Date(lastChange.valueOf());
                cooldownEnds.setDate(cooldownEnds.getDate() + NAME_CHANGE_COOLDOWN_DAYS);
                const today = new Date();

                if (today < cooldownEnds) {
                    setIsNameChangeCooldownActive(true);
                    setNextNameChangeDate(cooldownEnds.toLocaleDateString());
                } else {
                    setIsNameChangeCooldownActive(false);
                    setNextNameChangeDate(null);
                }
            } else {
                 setIsNameChangeCooldownActive(false);
                 setNextNameChangeDate(null);
            }
        } catch (err) {
            setError(`Failed to load profile: ${err.message}`);
            setProfileData(null);
        } finally {
            setLoading(false);
        }
    }, [paramsUserId, currentUser, navigate]);

    useEffect(() => {
        if (currentUser) {
            loadProfile();
        }
    }, [currentUser, paramsUserId, loadProfile]);

    useEffect(() => {
        if (profileData) {
            initializeEditableFields(profileData);
        }
    }, [profileData, initializeEditableFields]);


     useEffect(() => {
        const currentFieldsSource = editMode ? editableFields : profileData;
        if (currentFieldsSource && currentFieldsSource.home_state && currentFieldsSource.economic_stance !== undefined && currentFieldsSource.social_stance !== undefined) {
            setAlignment(calculateStateAlignment(currentFieldsSource.economic_stance, currentFieldsSource.social_stance, currentFieldsSource.home_state));
        }
        if (editMode && profileData && editableFields.economic_stance !== undefined) {
            setEconStancePCCost(Math.abs(editableFields.economic_stance - profileData.economic_stance) * STANCE_CHANGE_PC_PER_POSITION);
        }
        if (editMode && profileData && editableFields.social_stance !== undefined) {
             setSocialStancePCCost(Math.abs(editableFields.social_stance - profileData.social_stance) * STANCE_CHANGE_PC_PER_POSITION);
        }

    }, [editMode, profileData, editableFields.economic_stance, editableFields.social_stance, editableFields.home_state]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "bio") {
            if (value.length <= 255) {
                setEditableFields(prev => ({ ...prev, [name]: value }));
                setBioCharCount(value.length);
            }
        } else {
            setEditableFields(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStanceChange = (name, valueStr) => {
        const value = parseInt(valueStr, 10);
        setEditableFields(prev => ({ ...prev, [name]: value }));
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            
            if (file.size > 5 * 1024 * 1024) {
                setError(`File size too large (${fileSizeMB}MB). Maximum 5MB allowed. Try compressing your image or selecting a smaller file.`);
                setSelectedProfilePictureFile(null);
                setProfilePicturePreview(editableFields.profile_picture_url || null);
                e.target.value = null;
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                setError("Invalid file type. Only JPG, PNG, GIF allowed.");
                setSelectedProfilePictureFile(null);
                setProfilePicturePreview(editableFields.profile_picture_url || null);
                e.target.value = null;
                return;
            }
            clearMessages();
            setSelectedProfilePictureFile(file);
            setProfilePicturePreview(URL.createObjectURL(file));
            setSuccess(`Selected: ${file.name} (${fileSizeMB}MB)`);
        }
    };

    const handleProfilePictureUpload = async () => {
        if (!selectedProfilePictureFile) {
            setError("No picture selected to upload.");
            return;
        }
        
        // Double-check file size before upload
        if (selectedProfilePictureFile.size > 5 * 1024 * 1024) {
            setError("File size too large. Please select a smaller image (max 5MB).");
            return;
        }
        
        clearMessages();
        setIsUploadingPicture(true);
        const formData = new FormData();
        formData.append('profilePicture', selectedProfilePictureFile);

        try {
            const response = await apiCall('/profile/picture', {
                method: 'POST',
                body: formData,
                headers: {
                    ...(localStorage.getItem('authToken') && { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` })
                },
            }, true);

            setProfileData(response.updatedProfile);
            if (setCurrentUser) setCurrentUser(response.updatedProfile);
            initializeEditableFields(response.updatedProfile);
            setSelectedProfilePictureFile(null);
            setSuccess(response.message || "Profile picture updated successfully!");
        } catch (err) {
            let errorMessage = err.message || "Failed to upload picture.";
            
            // Provide more helpful error messages based on common issues
            if (errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('Content Too Large')) {
                errorMessage = "Image file is too large. Please use an image under 5MB. You can compress your image using online tools or photo editing software.";
            } else if (errorMessage.includes('400') || errorMessage.includes('Invalid file type')) {
                errorMessage = "Invalid file type. Please use JPG, PNG, or GIF format only.";
            } else if (errorMessage.includes('401') || errorMessage.includes('token')) {
                errorMessage = "Session expired. Please log out and log back in.";
            } else if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
                errorMessage = "Server error occurred. Please try again in a few moments.";
            }
            
            setError(errorMessage);
        } finally {
            setIsUploadingPicture(false);
        }
    };

    const handleRemoveProfilePicture = async () => {
        clearMessages();
        if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
        setIsUploadingPicture(true);
        try {
            const response = await apiCall('/profile/picture', { method: 'DELETE' });
            setProfileData(response.updatedProfile);
            if (setCurrentUser) setCurrentUser(response.updatedProfile);
            initializeEditableFields(response.updatedProfile);
            setSelectedProfilePictureFile(null);
            setProfilePicturePreview(null);
            setSuccess(response.message || "Profile picture removed.");
        } catch (err) {
            setError(err.message || "Failed to remove picture.");
        } finally {
            setIsUploadingPicture(false);
        }
    };


    const handleSaveChanges = async () => {
        clearMessages();

        const nameChanged = editableFields.firstName !== profileData.first_name || editableFields.lastName !== profileData.last_name;
        const econStanceChanged = editableFields.economic_stance !== profileData.economic_stance;
        const socialStanceChanged = editableFields.social_stance !== profileData.social_stance;

        if (nameChanged && isNameChangeCooldownActive) {
            setError(`You cannot change your name yet. Next available change: ${nextNameChangeDate}.`);
            return;
        }
        if (nameChanged && !isNameChangeCooldownActive) {
            if (!window.confirm(`You are about to change your character's name. This can only be done once every ${NAME_CHANGE_COOLDOWN_DAYS} days. Are you sure?`)) {
                return;
            }
        }

        const totalPCCostForStances = (econStanceChanged ? Math.abs(editableFields.economic_stance - profileData.economic_stance) * STANCE_CHANGE_PC_PER_POSITION : 0) +
                                   (socialStanceChanged ? Math.abs(editableFields.social_stance - profileData.social_stance) * STANCE_CHANGE_PC_PER_POSITION : 0);


        if (totalPCCostForStances > 0 && currentUser.political_capital < totalPCCostForStances) {
            setError(`Insufficient Political Capital. You need ${totalPCCostForStances} PC to make these stance changes. You have ${currentUser.political_capital} PC.`);
            return;
        }
        if (totalPCCostForStances > 0) {
            if (!window.confirm(`Changing stances will cost ${totalPCCostForStances} Political Capital and may affect your approval rating. Proceed?`)) {
                return;
            }
        }

        try {
            const payload = {};
            if (nameChanged && !isNameChangeCooldownActive) {
                payload.firstName = editableFields.firstName;
                payload.lastName = editableFields.lastName;
            }
            const sourceForUpdate = { ...profileData, ...editableFields };

            if (econStanceChanged) payload.economicStance = parseInt(sourceForUpdate.economic_stance, 10);
            if (socialStanceChanged) payload.socialStance = parseInt(sourceForUpdate.social_stance, 10);
            if (sourceForUpdate.bio !== profileData.bio) payload.bio = sourceForUpdate.bio;
            if (sourceForUpdate.gender !== profileData.gender) payload.gender = sourceForUpdate.gender;
            if (sourceForUpdate.race !== profileData.race) payload.race = sourceForUpdate.race;
            if (sourceForUpdate.religion !== profileData.religion) payload.religion = sourceForUpdate.religion;
            if (sourceForUpdate.age !== profileData.age) payload.age = sourceForUpdate.age ? parseInt(sourceForUpdate.age, 10) : null;
            if (sourceForUpdate.party !== profileData.party) payload.party = sourceForUpdate.party;
            if (sourceForUpdate.home_state !== profileData.home_state) payload.homeState = sourceForUpdate.home_state;

            if (Object.keys(payload).length === 0) {
                setSuccess("No changes were made to your profile.");
                setEditMode(false);
                return;
            }

            const response = await apiCall('/profile', { method: 'PUT', body: JSON.stringify(payload) });

            setProfileData(response.updatedProfile);
            if (setCurrentUser) setCurrentUser(response.updatedProfile);
            initializeEditableFields(response.updatedProfile);
            setEditMode(false);
            setSuccess(response.message || 'Profile updated successfully!');

            if (response.updatedProfile.last_name_change_date) {
                const lastChange = new Date(response.updatedProfile.last_name_change_date);
                let cooldownEnds = new Date(lastChange.valueOf());
                cooldownEnds.setDate(cooldownEnds.getDate() + NAME_CHANGE_COOLDOWN_DAYS);
                const today = new Date();
                if (today < cooldownEnds) {
                    setIsNameChangeCooldownActive(true);
                    setNextNameChangeDate(cooldownEnds.toLocaleDateString());
                } else {
                    setIsNameChangeCooldownActive(false);
                    setNextNameChangeDate(null);
                }
            }
        } catch (err) {
            setError(`Failed to save changes: ${err.message}`);
        }
    };

    const copyProfileLink = () => {
        if (profileData && profileData.user_id) {
            const link = `${window.location.origin}/profile/${profileData.user_id}`;
            navigator.clipboard.writeText(link).then(() => {
                setJustCopied(true);
                setTimeout(() => setJustCopied(false), 2000);
            });
        }
    };

    const renderGubernatorialHistory = (history) => {
        if (!history || typeof history !== 'object' || Object.keys(history).length === 0) {
            return <p className="text-sm text-gray-500">No gubernatorial history.</p>;
        }
        return ( <ul className="space-y-2"> {Object.entries(history).map(([state, data]) => ( <li key={state} className="text-sm"> <strong className="text-gray-300">{state}:</strong> {data.terms_served} term(s) served. {data.previous_terms && data.previous_terms.length > 0 && ( <ul className="list-disc list-inside pl-4 text-xs text-gray-400"> {data.previous_terms.map((term, i) => <li key={i}>{term.start_year} - {term.end_year}</li>)} </ul> )} </li> ))} </ul> );
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Loading profile...</div>;
    if (error && !profileData && !loading) return <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>;
    if (!profileData && !loading) return <div className="text-center py-10 text-gray-400">Profile not found.</div>;
    if (!profileData) return <div className="text-center py-10 text-gray-400">Profile data unavailable. Please refresh.</div>;

    const totalPCCostDisplay = econStancePCCost + socialStancePCCost;

    return (
        <>
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl max-w-4xl mx-auto">
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded text-sm mb-4 flex items-center"><AlertTriangle size={16} className="mr-2"/>{error}</p>}
                {success && <p className="bg-green-500/20 text-green-300 p-3 rounded text-sm mb-4 flex items-center"><Check size={16} className="mr-2"/>{success}</p>}

                {isOwnProfile && ( <div className="mb-4 bg-gray-900/50 p-3 rounded-lg"> <label className="text-xs text-gray-400">Your Shareable Profile Link</label> <div className="flex items-center gap-2 mt-1"> <input type="text" readOnly value={`${window.location.origin}/profile/${profileData.user_id}`} className="w-full bg-gray-700 text-gray-300 p-1 rounded-md text-sm border-gray-600"/> <button onClick={copyProfileLink} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center shrink-0"> {justCopied ? <Check size={16} className="mr-1.5"/> : <Copy size={16} className="mr-1.5"/>} {justCopied ? 'Copied!' : 'Copy'} </button> </div> </div> )}
                {isOwnProfile && isNameChangeCooldownActive && editMode && ( <div className="mb-4 bg-yellow-600/20 text-yellow-300 p-3 rounded text-sm flex items-center"> <Lock size={16} className="mr-2" /> Name fields are locked. You can change your name again on {nextNameChangeDate}. </div> )}

                <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
                    <div className="relative mb-4 sm:mb-0 sm:mr-6 shrink-0">
                        {editMode && isOwnProfile ? (
                            <div className="flex flex-col items-center">
                                {profilePicturePreview ? (
                                    <img src={profilePicturePreview} alt="Profile Preview" className="h-32 w-32 rounded-full object-cover border-4 border-blue-500/50 mb-2"/>
                                ) : (
                                    <UserCircle2 className="h-32 w-32 text-gray-500 border-4 border-gray-700 rounded-full p-2 mb-2"/>
                                )}
                                <label htmlFor="profilePictureInput" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md cursor-pointer shadow-md text-xs flex items-center justify-center">
                                    <UploadCloud size={14} className="mr-1.5"/> Change Picture
                                </label>
                                <input type="file" id="profilePictureInput" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleProfilePictureChange} />
                                <p className="text-xs text-gray-400 text-center mt-1 max-w-28">JPG, PNG, GIF • Max 5MB</p>
                                {selectedProfilePictureFile && (
                                     <button onClick={handleProfilePictureUpload} disabled={isUploadingPicture} className="mt-2 w-full text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded">
                                        {isUploadingPicture ? "Uploading..." : "Upload New Picture"}
                                    </button>
                                )}
                                 {editableFields.profile_picture_url && !selectedProfilePictureFile && (
                                    <button onClick={handleRemoveProfilePicture} disabled={isUploadingPicture} className="mt-2 w-full text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded">
                                        {isUploadingPicture ? "Removing..." : "Remove Picture"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            profileData.profile_picture_url ? (
                                <img src={profileData.profile_picture_url} alt={`${profileData.first_name} ${profileData.last_name}`} className="h-32 w-32 rounded-full object-cover border-4 border-gray-700"/>
                            ) : (
                                <UserCircle2 className="h-32 w-32 text-gray-500 border-4 border-gray-700 rounded-full p-2"/>
                            )
                        )}
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                        <h2 className="text-3xl font-bold text-blue-300"> {profileData.first_name} {profileData.last_name} <span className="text-lg text-gray-400 ml-2">(@{profileData.username || 'N/A'})</span> </h2>
                    </div>
                     {isOwnProfile && (
                        <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-auto shrink-0">
                            {editMode ? (
                                <> <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"><Save size={16} className="mr-2"/> Save</button>
                                <button onClick={() => { setEditMode(false); clearMessages(); initializeEditableFields(profileData); setSelectedProfilePictureFile(null); setProfilePicturePreview(profileData.profile_picture_url || null);}} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm">Cancel</button> </>
                            ) : (
                                <>
                                <button onClick={() => { initializeEditableFields(profileData); setEditMode(true); clearMessages();}} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"><Edit3 size={16} className="mr-2"/> Edit Profile</button>
                                <button onClick={() => { clearMessages(); setShowPasswordModal(true);}} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm flex items-center"><SettingsIcon size={16} className="mr-2"/> Settings</button>
                                </>
                            )}
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        <InfoCard title="Personal Information" icon={<User size={18}/>}>
                            {isOwnProfile && editMode ? (
                                <>
                                    <EditableField label="First Name" name="firstName" value={editableFields.firstName || ''} onChange={handleInputChange} disabled={isNameChangeCooldownActive} />
                                    <EditableField label="Last Name" name="lastName" value={editableFields.lastName || ''} onChange={handleInputChange} disabled={isNameChangeCooldownActive} />
                                    <EditableDropdownField label="Age" name="age" value={editableFields.age || ''} onChange={handleInputChange} options={ageOptions.map(age => ({value: age, label: age.toString()}))} placeholder="Select Age"/>
                                    <EditableDropdownField label="Gender" name="gender" value={editableFields.gender || ''} onChange={handleInputChange} options={genderOptions.map(g => ({value: g, label: g}))} placeholder="Select Gender"/>
                                    <EditableDropdownField label="Race/Ethnicity" name="race" value={editableFields.race || ''} onChange={handleInputChange} options={raceOptions.map(r => ({value: r, label: r}))} placeholder="Select Race/Ethnicity"/>
                                    <EditableDropdownField label="Religion" name="religion" value={editableFields.religion || ''} onChange={handleInputChange} options={religionOptions.map(r => ({value: r, label: r}))} placeholder="Select Religion"/>
                                </>
                            ) : (
                                <>
                                    <ReadOnlyField label="Name" value={`${profileData.first_name} ${profileData.last_name}`} />
                                    {profileData.age && <ReadOnlyField label="Age" value={profileData.age} />}
                                    {profileData.gender && <ReadOnlyField label="Gender" value={profileData.gender} />}
                                    {profileData.race && <ReadOnlyField label="Race/Ethnicity" value={profileData.race} />}
                                    {profileData.religion && <ReadOnlyField label="Religion" value={profileData.religion} />}
                                </>
                            )}
                            {/* Email field has been removed from here */}
                            <ReadOnlyField label="Username" value={`@${profileData.username || 'N/A'}`} icon={<User size={14}/>} />
                        </InfoCard>
                        <InfoCard title="Political Stats" icon={<TrendingUp size={18}/>}>
                            <ReadOnlyField label="Approval Rating" value={`${profileData.approval_rating}%`} />
                            <ReadOnlyField label="Campaign Funds" value={`$${profileData.campaign_funds?.toLocaleString()}`} icon={<DollarSign size={14}/>}/>
                            <ReadOnlyField label="Political Capital" value={profileData.political_capital} icon={<Briefcase size={14}/>}/>
                            <ReadOnlyField label="Action Points" value={profileData.action_points} />
                            <ReadOnlyField label="State Name Recognition" value={`${formatPercentage(profileData.state_name_recognition)}%`} />
                            <ReadOnlyField label="Campaign Strength" value={`${formatPercentage(profileData.campaign_strength)}%`} />
                        </InfoCard>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <InfoCard title="Political Identity" icon={<Shield size={18}/>}>
                            <ReadOnlyField label="Party" value={profileData.party || 'N/A'} />
                            <ReadOnlyField label="Home State" value={profileData.home_state || 'N/A'} icon={<MapPin size={14}/>}/>

                            {isOwnProfile && editMode ? (
                                <>
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-300">Economic Stance: {getStanceLabel(editableFields.economic_stance)} </label>
                                        <input type="range" min="1" max="7" name="economic_stance" value={Number(editableFields.economic_stance || 4)} onChange={(e) => handleStanceChange('economic_stance', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-1"/>
                                        <p className={`text-xs text-center ${econStancePCCost > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>Cost: {econStancePCCost} PC</p>
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-gray-300">Social Stance: {getStanceLabel(editableFields.social_stance)} </label>
                                        <input type="range" min="1" max="7" name="social_stance" value={Number(editableFields.social_stance || 4)} onChange={(e) => handleStanceChange('social_stance', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-1"/>
                                        <p className={`text-xs text-center ${socialStancePCCost > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>Cost: {socialStancePCCost} PC</p>
                                    </div>
                                    { (econStancePCCost > 0 || socialStancePCCost > 0) &&
                                        <div className="mt-3 pt-2 border-t border-gray-700">
                                            <p className="text-sm font-semibold text-center text-amber-300">Total Stance Change Cost: {totalPCCostDisplay} PC</p>
                                            <p className="text-xs text-center text-gray-400">(Your approval rating may also change)</p>
                                        </div>
                                    }
                                </>
                            ) : (
                                <>
                                    <ReadOnlyField label="Economic Stance" value={getStanceLabel(profileData.economic_stance)} />
                                    <ReadOnlyField label="Social Stance" value={getStanceLabel(profileData.social_stance)} />
                                </>
                            )}
                            { profileData.home_state && (profileData.economic_stance !== undefined && profileData.social_stance !== undefined) && ( <div className="bg-gray-700/50 p-3 rounded-md mt-3"> <h4 className="text-xs font-semibold text-gray-200 mb-1">Alignment with {profileData.home_state}:</h4> <p className="text-xs text-gray-300">Economic Match: <span className="font-bold text-gray-100">{alignment.economicMatch}%</span></p> <p className="text-xs text-gray-300">Social Match: <span className="font-bold text-gray-100">{alignment.socialMatch}%</span></p> <p className="text-xs text-gray-200 mt-0.5">Overall: <span className="font-bold text-blue-300">{alignment.overallAlignment}%</span></p> </div> )}
                        </InfoCard>
                        <InfoCard title="Biography" icon={<Info size={18}/>}>
                            {isOwnProfile && editMode ? (
                                <>
                                    <textarea name="bio" value={editableFields.bio || ''} onChange={handleInputChange} placeholder="Your political background, goals, and vision..." className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 h-28 text-sm" maxLength={255}></textarea>
                                    <p className="text-xs text-gray-400 text-right">{bioCharCount}/255</p>
                                </>
                            ) : ( <p className="text-sm text-gray-300 whitespace-pre-wrap">{profileData.bio || <span className="text-gray-500">No bio provided.</span>}</p> )}
                        </InfoCard>
                        <InfoCard title="Political Career" icon={<Award size={18}/>}>
                             <ReadOnlyField label="Current Office" value={profileData.current_office || 'Citizen'} />
                             <ReadOnlyField label="Elections Won" value={profileData.elections_won || 0} />
                             <ReadOnlyField label="Elections Lost" value={profileData.elections_lost || 0} />
                             <ReadOnlyField label="Total Votes Received" value={profileData.total_votes_received?.toLocaleString() || 0} />
                             <div className="mt-3"> <h4 className="text-sm font-semibold text-gray-200 mb-1">Gubernatorial History:</h4> {renderGubernatorialHistory(profileData.gubernatorial_history)} </div>
                        </InfoCard>
                    </div>
                </div>
            </div>
            {isOwnProfile && showPasswordModal && (
                <SettingsModal
                    isOpen={showPasswordModal}
                    onClose={() => { setShowPasswordModal(false); clearMessages(); }}
                    onSuccess={(message) => { setSuccess(message); setShowPasswordModal(false); }}
                    onError={(message) => { setError(message); }}
                    userEmail={currentUser?.email}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                />
            )}
            <div className="max-w-4xl mx-auto mt-6">
                <ActiveCampaignsCard 
                    userId={profileData?.user_id} 
                    isOwnProfile={isOwnProfile} 
                />
            </div>
        </>
    );
}

// Helper Components
const InfoCard = ({ title, icon, children }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-blue-200 mb-3 flex items-center border-b border-gray-600 pb-2">
            {icon && React.cloneElement(icon, { className: "mr-2" })}
            {title}
        </h3>
        <div className="space-y-2">{children}</div>
    </div>
);

const EditableDropdownField = ({ label, name, value, onChange, options, placeholder }) => (
    <div className="mb-2">
        <label htmlFor={name} className="block text-xs font-medium text-gray-300 mb-0.5">{label}</label>
        <select 
            name={name} 
            id={name} 
            value={value || ''} 
            onChange={onChange} 
            className="w-full p-1.5 bg-gray-600 rounded text-white border border-gray-500 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);
