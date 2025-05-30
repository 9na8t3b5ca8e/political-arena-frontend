import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';
import PlayerDisplayName from './PlayerDisplayName'; // Import PlayerDisplayName
import StanceDisplay from './StanceDisplay'; // Import StanceDisplay
import { formatDateOnly, formatLongDate } from '../utils/dateUtils'; // Import date utilities
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
    const [selectedPosition, setSelectedPosition] = useState('');

    // State for leadership voting
    const [selectedChairVote, setSelectedChairVote] = useState('');
    const [selectedViceChairVote, setSelectedViceChairVote] = useState('');
    const [selectedTreasurerVote, setSelectedTreasurerVote] = useState('');
    const [electionCycleDateDisplay, setElectionCycleDateDisplay] = useState('');
    const [electionCycleEndDisplay, setElectionCycleEndDisplay] = useState('');

    // New state for enhanced features
    const [currentUserVotes, setCurrentUserVotes] = useState({});
    const [voteTallies, setVoteTallies] = useState({ chair: [], vice_chair: [], treasurer: [], total_eligible_voters: 0 });
    const [userCandidacies, setUserCandidacies] = useState([]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [partyRes, candidatesRes, votesRes, talliesRes] = await Promise.all([
                    apiCall(`/party/${partyId}`),
                    apiCall(`/party/${partyId}/candidates`),
                    apiCall(`/party/${partyId}/votes/current`),
                    apiCall(`/party/${partyId}/votes/tallies`)
                ]);
                setPartyDetails(partyRes);
                setCandidates(candidatesRes);
                setCurrentUserVotes(votesRes);
                setVoteTallies(talliesRes);

                // Set initial vote selections based on current user votes
                setSelectedChairVote(votesRes.chair_vote_user_id ? votesRes.chair_vote_user_id.toString() : '');
                setSelectedViceChairVote(votesRes.vice_chair_vote_user_id ? votesRes.vice_chair_vote_user_id.toString() : '');
                setSelectedTreasurerVote(votesRes.treasurer_vote_user_id ? votesRes.treasurer_vote_user_id.toString() : '');

                // Check if current user is running for any positions
                if (currentUser) {
                    const userCands = candidatesRes.filter(c => c.user_id === currentUser.id);
                    setUserCandidacies(userCands);
                }

                setLoading(false);

                // Calculate and set election cycle date for display
                const currentDate = new Date();
                const dayOfWeek = currentDate.getDay();
                const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const electionCycleStartDate = new Date(currentDate);
                electionCycleStartDate.setDate(currentDate.getDate() + difference);
                electionCycleStartDate.setHours(0,0,0,0);
                setElectionCycleDateDisplay(formatDateOnly(electionCycleStartDate));
                // Calculate end of cycle (Sunday 11:59 PM)
                const electionCycleEndDate = new Date(electionCycleStartDate);
                electionCycleEndDate.setDate(electionCycleStartDate.getDate() + 6);
                electionCycleEndDate.setHours(23,59,59,999);
                setElectionCycleEndDisplay(formatLongDate(electionCycleEndDate));

            } catch (err) {
                setError('Failed to load party data');
                setLoading(false);
            }
        };

        fetchData();
    }, [partyId, currentUser]);

    const refreshData = async () => {
        try {
            const [candidatesRes, votesRes, talliesRes] = await Promise.all([
                apiCall(`/party/${partyId}/candidates`),
                apiCall(`/party/${partyId}/votes/current`),
                apiCall(`/party/${partyId}/votes/tallies`)
            ]);
            setCandidates(candidatesRes);
            setCurrentUserVotes(votesRes);
            setVoteTallies(talliesRes);

            // Update user candidacies
            if (currentUser) {
                const userCands = candidatesRes.filter(c => c.user_id === currentUser.id);
                setUserCandidacies(userCands);
            }
        } catch (err) {
            console.error('Error refreshing data:', err);
        }
    };

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
                    position: selectedPosition
                })
            });
            // Reset form
            setSelectedPosition('');
            // Refresh data
            await refreshData();
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to submit candidacy');
        }
    };

    const handleWithdrawCandidacy = async (position) => {
        try {
            await apiCall('/party/leadership/withdraw', {
                method: 'POST',
                body: JSON.stringify({
                    partyId,
                    position
                })
            });
            // Refresh data
            await refreshData();
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to withdraw candidacy');
        }
    };

    const handleLeadershipVote = async (e) => { // Modified to take event
        e.preventDefault(); // Prevent default form submission
        try {
            await apiCall('/party/leadership/vote', {
                method: 'POST',
                body: JSON.stringify({
                    partyId,
                    chairVoteId: selectedChairVote ? parseInt(selectedChairVote) : null,
                    viceChairVoteId: selectedViceChairVote ? parseInt(selectedViceChairVote) : null,
                    treasurerVoteId: selectedTreasurerVote ? parseInt(selectedTreasurerVote) : null
                })
            });
            
            // Refresh data to get updated votes and tallies
            await refreshData();
            setError(null); // Clear previous errors
            
            // Refresh party details (might show updated leadership if election processed)
            const partyRes = await apiCall(`/party/${partyId}`);
            setPartyDetails(partyRes);
            alert('Votes submitted successfully!'); // Or use a more subtle notification
        } catch (err) {
            setError(err.message || 'Failed to submit vote');
        }
    };

    const getVoteCount = (position, candidateId) => {
        const tallies = voteTallies[position] || [];
        const tally = tallies.find(t => t.candidate_id === candidateId);
        return tally ? tally.vote_count : 0;
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;

    const isPartyLeader = currentUser && partyDetails && 
        (partyDetails.chair_user_id === currentUser.id || 
         partyDetails.vice_chair_user_id === currentUser.id || 
         partyDetails.treasurer_user_id === currentUser.id);

    const availablePositions = ['chair', 'vice_chair', 'treasurer'].filter(position => 
        !userCandidacies.some(candidacy => candidacy.position_contested === position)
    );

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
                        {partyDetails.chair_details ? (
                            <PlayerDisplayName 
                                userId={partyDetails.chair_details.id} 
                                firstName={partyDetails.chair_details.first_name} 
                                lastName={partyDetails.chair_details.last_name} 
                                profilePictureUrl={partyDetails.chair_details.profile_picture_url}
                                includePic={true} picSize="h-5 w-5"
                            />
                        ) : <p>Vacant</p>}
                    </div>
                    <div>
                        <p className="font-semibold">Vice Chair:</p>
                        {partyDetails.vice_chair_details ? (
                            <PlayerDisplayName 
                                userId={partyDetails.vice_chair_details.id} 
                                firstName={partyDetails.vice_chair_details.first_name} 
                                lastName={partyDetails.vice_chair_details.last_name} 
                                profilePictureUrl={partyDetails.vice_chair_details.profile_picture_url}
                                includePic={true} picSize="h-5 w-5"
                            />
                        ) : <p>Vacant</p>}
                    </div>
                    <div>
                        <p className="font-semibold">Treasurer:</p>
                        {partyDetails.treasurer_details ? (
                            <PlayerDisplayName 
                                userId={partyDetails.treasurer_details.id} 
                                firstName={partyDetails.treasurer_details.first_name} 
                                lastName={partyDetails.treasurer_details.last_name} 
                                profilePictureUrl={partyDetails.treasurer_details.profile_picture_url}
                                includePic={true} picSize="h-5 w-5"
                            />
                        ) : <p>Vacant</p>}
                    </div>
                    <div>
                        <p className="font-semibold">Economic Stance:</p>
                        <StanceDisplay value={partyDetails.economic_stance} label={partyDetails.economic_stance_label} type="economic" />
                    </div>
                    <div>
                        <p className="font-semibold">Social Stance:</p>
                        <StanceDisplay value={partyDetails.social_stance} label={partyDetails.social_stance_label} type="social" />
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
            {userCandidacies.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Current Candidacies</h3>
                    <div className="space-y-3">
                        {userCandidacies.map((candidacy) => (
                            <div key={candidacy.position_contested} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <span className="font-medium text-blue-800">
                                    Running for {candidacy.position_contested.replace('_', ' ')}
                                </span>
                                <button
                                    onClick={() => handleWithdrawCandidacy(candidacy.position_contested)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                                >
                                    Withdraw from {candidacy.position_contested.replace('_', ' ')} Race
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {availablePositions.length > 0 && (
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
                                {availablePositions.map((position) => (
                                    <option key={position} value={position}>
                                        {position.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            Submit Candidacy
                        </button>
                    </form>
                </div>
            )}

            {/* Leadership Election Voting Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-2">Party Leadership Election</h3>
                <p className="text-sm text-gray-600 mb-1">Voting for the week of: <span className="font-semibold">{electionCycleDateDisplay}</span></p>
                <p className="text-xs text-blue-700 mb-2">Voting closes: <span className="font-semibold">{electionCycleEndDisplay}</span>. Results are applied at the start of next week.</p>
                <p className="text-xs text-gray-600 mb-4">Total eligible voters: <span className="font-semibold">{voteTallies.total_eligible_voters}</span></p>
                
                {candidates.length === 0 ? (
                    <p className="text-gray-500">No candidates have run for leadership positions in the current election cycle.</p>
                ) : (
                    <form onSubmit={handleLeadershipVote} className="space-y-6">
                        {['chair', 'vice_chair', 'treasurer'].map((position) => {
                            const positionCandidates = candidates.filter(
                                (c) => c.position_contested === position
                            );
                            let currentVote, setCurrentVote;
                            if (position === 'chair') { currentVote = selectedChairVote; setCurrentVote = setSelectedChairVote; }
                            else if (position === 'vice_chair') { currentVote = selectedViceChairVote; setCurrentVote = setSelectedViceChairVote; }
                            else { currentVote = selectedTreasurerVote; setCurrentVote = setSelectedTreasurerVote; }

                            return (
                                <div key={position}>
                                    <h4 className="font-semibold capitalize mb-2 text-gray-700">
                                        Vote for {position.replace('_', ' ')}
                                    </h4>
                                    {positionCandidates.length === 0 ? (
                                        <p className="text-sm text-gray-500">No candidates for this position.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name={position} 
                                                    value="" 
                                                    checked={currentVote === ""} 
                                                    onChange={(e) => setCurrentVote(e.target.value)}
                                                    className="form-radio h-4 w-4 text-blue-600"
                                                />
                                                <span className="text-gray-600 italic">Abstain (no vote)</span>
                                            </label>
                                            {positionCandidates.map((candidate) => {
                                                const voteCount = getVoteCount(position, candidate.user_id);
                                                return (
                                                    <label key={candidate.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                                                        <div className="flex items-center space-x-2">
                                                            <input 
                                                                type="radio" 
                                                                name={position} 
                                                                value={candidate.user_id} 
                                                                checked={currentVote === candidate.user_id.toString()} 
                                                                onChange={(e) => setCurrentVote(e.target.value)}
                                                                className="form-radio h-4 w-4 text-blue-600"
                                                            />
                                                            <PlayerDisplayName 
                                                                userId={candidate.user_id} 
                                                                firstName={candidate.first_name} 
                                                                lastName={candidate.last_name} 
                                                                profilePictureUrl={candidate.profile_picture_url}
                                                                includePic={true}
                                                                picSize="h-8 w-8"
                                                                textClass="text-gray-800"
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-semibold text-blue-600">
                                                                {voteCount} vote{voteCount !== 1 ? 's' : ''}
                                                            </span>
                                                            {voteTallies.total_eligible_voters > 0 && (
                                                                <span className="text-xs text-gray-500">
                                                                    ({Math.round((voteCount / voteTallies.total_eligible_voters) * 100)}%)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="flex space-x-4">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setSelectedChairVote('');
                                    setSelectedViceChairVote('');
                                    setSelectedTreasurerVote('');
                                }}
                                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                            >
                                Clear All Votes
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                disabled={candidates.length === 0} // Disable if no candidates at all
                            >
                                Submit Votes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PartyManagement; 