import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import PartyManagement from '../components/PartyManagement';
import PartyMembers from '../components/PartyMembers';
import { useParams } from 'react-router-dom';

const PartyPage = ({ currentUser }) => {
    const { partyId } = useParams();
    const [partyDetails, setPartyDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // If no partyId in URL, use the user's party
    const targetPartyId = partyId || currentUser?.party_id;

    useEffect(() => {
        const fetchPartyDetails = async () => {
            if (targetPartyId) {
                try {
                    const details = await apiCall(`/party/${targetPartyId}`);
                    setPartyDetails(details);
                } catch (err) {
                    console.error('Failed to load party details:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        
        fetchPartyDetails();
    }, [targetPartyId]);

    if (!targetPartyId) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Party Management</h2>
                <p className="text-gray-400">You are not a member of any party.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Loading...</h2>
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