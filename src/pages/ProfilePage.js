// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../api';
import { stanceScale, allStates, stateData as allStateData } from '../state-data';
import { Edit3, Save, User, MapPin, DollarSign, TrendingUp, Briefcase, Shield, Award, Info, Mail, Hash, Copy, Check, AlertTriangle } from 'lucide-react';

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
    const [bioCharCount, setBioCharCount] = useState(0);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError('');

        if (!currentUser) {
            navigate('/');
            return;
        }

        try {
            const targetUserId = paramsUserId ? parseInt(paramsUserId, 10) : currentUser.id;
            const viewingOwnProfile = targetUserId === currentUser.id;
            
            setIsOwnProfile(viewingOwnProfile);

            const data = viewingOwnProfile ? currentUser : await apiCall(`/profiles/${targetUserId}`);
            setProfileData(data);
            setBioCharCount(data.bio?.length || 0);
            
            if (viewingOwnProfile) {
                setEditableFields({
                    firstName: data.first_name || '', lastName: data.last_name || '',
                    party: data.party || '', home_state: data.home_state || '', // Will be read-only in edit mode
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
        if (currentUser) {
            loadProfile();
        }
    }, [currentUser, loadProfile]);

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
    
    const handleStanceChange = (name, value) => {
        setEditableFields(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    };

    const handleSaveChanges = async () => {
        setError('');
        let pcCost = 0;
        if (editableFields.economic_stance !== profileData.economic_stance) pcCost += 5;
        if (editableFields.social_stance !== profileData.social_stance) pcCost += 5;

        if (pcCost > 0 && currentUser.political_capital < pcCost) {
            setError(`Insufficient Political Capital. You need ${pcCost} PC to make these stance changes. You have ${currentUser.political_capital} PC.`);
            return;
        }
        if (pcCost > 0) {
            if (!window.confirm(`This change will cost ${pcCost} Political Capital and may affect your approval rating. Proceed?`)) {
                return;
            }
        }

        try {
            const payload = { // Party and Home State are not included as they are non-editable
                firstName: editableFields.firstName,
                lastName: editableFields.lastName,
                economicStance: parseInt(editableFields.economic_stance, 10),
                socialStance: parseInt(editableFields.social_stance, 10),
                bio: editableFields.bio,
                gender: editableFields.gender,
                race: editableFields.race,
                religion: editableFields.religion,
                age: editableFields.age ? parseInt(editableFields.age, 10) : null,
            };
            const { updatedProfile } = await apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
            setProfileData(updatedProfile);
            if (setCurrentUser) setCurrentUser(updatedProfile);
            setEditMode(false);
            setBioCharCount(updatedProfile.bio?.length || 0); // Update char count after save
        } catch (err) {
            setError(`Failed to save changes: ${err.message}`);
        }
    };
    
    const copyProfileLink = () => {
        const link = `<span class="math-inline">\{window\.location\.origin\}/profile/</span>{profileData.id}`;
        navigator.clipboard.writeText(link).then(() => {
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        });
    };
    
    const renderGubernatorialHistory = (history) => {
        if (!history || typeof history !== 'object' || Object.keys(history).length === 0) {
            return <p className="text-sm text-gray-500">No gubernatorial history.</p>;
        }
        return ( <ul className="space-y-2"> {Object.entries(history).map(([state, data]) => ( <li key={state} className="text-sm"> <strong className="text-gray-300">{state}:</strong> {data.terms_served} term(
