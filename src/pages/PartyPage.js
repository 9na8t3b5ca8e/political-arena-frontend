import React from 'react';
import PartyManagement from '../components/PartyManagement';
import { useParams } from 'react-router-dom';

const PartyPage = ({ currentUser }) => {
    const { partyId } = useParams();
    
    // If no partyId in URL, use the user's party
    const targetPartyId = partyId || currentUser?.party_id;

    if (!targetPartyId) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Party Management</h2>
                <p className="text-gray-400">You are not a member of any party.</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <PartyManagement partyId={targetPartyId} currentUser={currentUser} />
        </div>
    );
};

export default PartyPage; 