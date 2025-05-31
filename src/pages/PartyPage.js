import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import PartyManagement from '../components/PartyManagement';
import PartyMembers from '../components/PartyMembers';
import { useParams } from 'react-router-dom';

const PartyPage = ({ currentUser }) => {
    const { partyId } = useParams();
    const [partyDetails, setPartyDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const targetPartyId = partyId || currentUser?.party_id;

    useEffect(() => {
        const fetchPartyDetails = async () => {
            if (targetPartyId) {
                setError(null);
                setLoading(true);
                try {
                    const details = await apiCall(`/party/${targetPartyId}`);
                    setPartyDetails(details);
                } catch (err) {
                    console.error('Failed to load party details:', err);
                    setError('Failed to load party details. Please try refreshing the page.');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        
        fetchPartyDetails();
    }, [targetPartyId]);

    if (!targetPartyId && !loading) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Party Information</h2>
                <p className="text-gray-400">You are not currently a member of any party, or no party ID was specified.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Loading Party Information...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-800 border border-red-600 rounded-lg">
                <h2 className="text-2xl font-bold mb-2 text-red-100">Error</h2>
                <p className="text-red-200">{error}</p>
            </div>
        );
    }
    
    if (!partyDetails && !loading) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Party Not Found</h2>
                <p className="text-gray-400">The requested party (ID: {targetPartyId}) could not be found or has no details.</p>
            </div>
        );
    }

    const isIndependentParty = partyDetails?.name === 'Independent';

    return (
        <div className="space-y-6">
            {/* Independent Party Notice */}
            {isIndependentParty && (
                <div className="p-4 bg-blue-800 border border-blue-600 rounded-lg">
                    <h2 className="text-2xl font-bold mb-2 text-blue-100">Independent Political Affiliation</h2>
                    <p className="text-blue-200">
                        Independent is not a political party with formal leadership structure, dues, or organizational functions. 
                        It simply indicates political independence from major party affiliations.
                    </p>
                </div>
            )}
            
            {/* Party Management - Only show for actual parties, not Independent */}
            {!isIndependentParty && (
                <div className="p-4 bg-gray-800 rounded-lg">
                    <PartyManagement partyId={targetPartyId} currentUser={currentUser} />
                </div>
            )}
            
            {/* Party Members Section */}
            <PartyMembers 
                partyId={targetPartyId} 
            />
        </div>
    );
};

export default PartyPage; 