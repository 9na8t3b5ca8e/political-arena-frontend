import React, { useState, useEffect } from 'react';
import CampaignHQ from '../components/CampaignHQ';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../api'; // Import apiCall

const CampaignHQPage = () => {
    const { user: currentUser } = useAuth();
    const [activeCampaigns, setActiveCampaigns] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const fetchCampaignStatus = async () => {
                try {
                    setLoading(true);
                    const campaigns = await apiCall('/profile/my-candidacies');
                    setActiveCampaigns(campaigns.filter(c => c.status === 'active' || c.status === 'declared')); // Assuming 'active' or 'declared' means they can hire
                    setLoading(false);
                } catch (error) {
                    console.error("Failed to fetch active campaigns:", error);
                    setActiveCampaigns([]); // Assume no active campaigns on error
                    setLoading(false);
                }
            };
            fetchCampaignStatus();
        }
    }, [currentUser]);

    if (!currentUser) {
        return <Navigate to="/" />;
    }

    if (loading) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h1 className="text-2xl font-bold text-blue-300 mb-6">Campaign Headquarters</h1>
                <p className="text-gray-400">Loading campaign status...</p>
            </div>
        );
    }

    if (!activeCampaigns || activeCampaigns.length === 0) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h1 className="text-2xl font-bold text-blue-300 mb-6">Campaign Headquarters</h1>
                <p className="text-gray-300 bg-gray-700 p-4 rounded-md">
                    You must be actively running in an election (status: Declared or Active) to hire and manage campaign staff.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <h1 className="text-2xl font-bold text-blue-300 mb-6">Campaign Headquarters</h1>
            <CampaignHQ currentUser={currentUser} />
        </div>
    );
};

export default CampaignHQPage; 