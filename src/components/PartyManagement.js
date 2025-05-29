import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
// import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext provides currentUser

const PartyManagement = ({ partyId, currentUser }) => { // Added currentUser prop
    // const { user: currentUser } = useAuth(); // If using AuthContext
    const [partyDetails, setPartyDetails] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fundingAmount, setFundingAmount] = useState('');
    const [fundingReason, setFundingReason] = useState('');
    const [targetMemberId, setTargetMemberId] = useState('');
    const [targetMemberFirstName, setTargetMemberFirstName] = useState('');
    const [targetMemberLastName, setTargetMemberLastName] = useState('');
    const [platform, setPlatform] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partyRes, candidatesRes] = await Promise.all([
                    apiCall(`/party/${partyId}`),
                    apiCall(`/party/${partyId}/candidates`)
                ]);
                setPartyDetails(partyRes);
                setCandidates(candidatesRes);
                setLoading(false);
            } catch (err) {
                setError('Failed to load party data');
                setLoading(false);
            }
        };

        fetchData();
    }, [partyId]);

    const handleFundingProposal = async (e) => {
        e.preventDefault();
        try {
            await apiCall('/party/funding/propose', {
                method: 'POST',
                body: JSON.stringify({
                    partyId,
                    targetUserFirstName,
                    targetUserLastName,
                    amount: parseInt(fundingAmount),
                    reason: fundingReason
                })
            });
            // Reset form
            setFundingAmount('');
            setFundingReason('');
            setTargetMemberFirstName('');
            setTargetMemberLastName('');
            // Refresh party details
            const partyRes = await apiCall(`/party/${partyId}`);
            setPartyDetails(partyRes);
        } catch (err) {
            setError(err.message || 'Failed to submit funding proposal');
        }
    };

    const handleLeadershipCandidacy = async (e) => {
        e.preventDefault();
        try {
            await apiCall('/party/leadership/run', {
                method: 'POST',
                body: JSON.stringify({
                    partyId,
                    position: selectedPosition,
                    platform
                })
            });
            // Reset form
            setPlatform('');
            setSelectedPosition('');
            // Refresh candidates
            const candidatesRes = await apiCall(`/party/${partyId}/candidates`);
            setCandidates(candidatesRes);
        } catch (err) {
            setError(err.message || 'Failed to submit candidacy');
        }
    };

    const handleLeadershipVote = async (chairId, viceChairId, treasurerId) => {
        try {
            await apiCall('/party/leadership/vote', {
                method: 'POST',
                body: JSON.stringify({
                    partyId,
                    chairVoteId: chairId,
                    viceChairVoteId: viceChairId,
                    treasurerVoteId: treasurerId
                })
            });
            // Refresh party details
            const partyRes = await apiCall(`/party/${partyId}`);
            setPartyDetails(partyRes);
        } catch (err) {
            setError(err.message || 'Failed to submit vote');
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;

    const isPartyLeader = currentUser && partyDetails && 
        (partyDetails.chair_user_id === currentUser.id || 
         partyDetails.vice_chair_user_id === currentUser.id || 
         partyDetails.treasurer_user_id === currentUser.id);

    return (
        <div className="p-4 space-y-6 text-gray-900">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Party Management</h2>

            {/* Party Details */}
            {partyDetails && (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Party Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold">Party Name:</p>
                        <p>{partyDetails.name}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Treasury Balance:</p>
                        <p>{formatCurrency(partyDetails.treasury_balance)}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Chair:</p>
                        <p>{partyDetails.chair_username || 'Vacant'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Vice Chair:</p>
                        <p>{partyDetails.vice_chair_username || 'Vacant'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Treasurer:</p>
                        <p>{partyDetails.treasurer_username || 'Vacant'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Economic Stance:</p>
                        <p>{partyDetails.economic_stance_label || 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Social Stance:</p>
                        <p>{partyDetails.social_stance_label || 'Not Set'}</p>
                    </div>
                </div>
            </div>
            )}

            {/* Funding Proposal Form - Conditional Rendering */}
            {isPartyLeader && (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Submit Funding Proposal</h3>
                <form onSubmit={handleFundingProposal} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Target Member First Name
                        </label>
                        <input
                            type="text"
                            value={targetMemberFirstName}
                            onChange={(e) => setTargetMemberFirstName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Target Member Last Name
                        </label>
                        <input
                            type="text"
                            value={targetMemberLastName}
                            onChange={(e) => setTargetMemberLastName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={fundingAmount}
                            onChange={(e) => setFundingAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Reason
                        </label>
                        <textarea
                            value={fundingReason}
                            onChange={(e) => setFundingReason(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="3"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Submit Proposal
                    </button>
                </form>
            </div>
            )}

            {/* Leadership Candidacy Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Submit Leadership Candidacy</h3>
                <form onSubmit={handleLeadershipCandidacy} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Position
                        </label>
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select a position...</option>
                            <option value="chair">Chair</option>
                            <option value="vice_chair">Vice Chair</option>
                            <option value="treasurer">Treasurer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Platform
                        </label>
                        <textarea
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="4"
                            placeholder="Describe your vision for the party, key goals, and what you will bring to this leadership role."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Submit Candidacy
                    </button>
                </form>
            </div>

            {/* Current Candidates */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Current Candidates</h3>
                {candidates.length === 0 ? (
                    <p className="text-gray-500">No current candidates.</p>
                ) : (
                    <div className="space-y-4">
                        {['chair', 'vice_chair', 'treasurer'].map((position) => {
                            const positionCandidates = candidates.filter(
                                (c) => c.position_contested === position
                            );
                            return (
                                <div key={position} className="border-t pt-4 first:border-t-0 first:pt-0">
                                    <h4 className="font-semibold capitalize mb-2">
                                        {position.replace('_', ' ')} Candidates
                                    </h4>
                                    {positionCandidates.length === 0 ? (
                                        <p className="text-gray-500">No candidates for this position.</p>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {positionCandidates.map((candidate) => (
                                                <div key={candidate.id} className="border rounded-lg p-4 text-gray-800">
                                                    <p className="font-semibold">{candidate.username}</p>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {candidate.platform}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyManagement; 