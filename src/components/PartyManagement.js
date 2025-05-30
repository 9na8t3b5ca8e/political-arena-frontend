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
    const [isSubmittingVotes, setIsSubmittingVotes] = useState(false);
    const [hasVotedThisCycle, setHasVotedThisCycle] = useState(false);
    const [lastVoteSubmissionTime, setLastVoteSubmissionTime] = useState(null);
    const [voteSubmissionMessage, setVoteSubmissionMessage] = useState('');

    // New state for party dues management
    const [newDuesPercentage, setNewDuesPercentage] = useState(0);
    const [isSettingDues, setIsSettingDues] = useState(false);
    const [duesMessage, setDuesMessage] = useState('');

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

                // Check if user has already voted in this cycle
                const hasExistingVotes = votesRes.chair_vote_user_id || votesRes.vice_chair_vote_user_id || votesRes.treasurer_vote_user_id;
                setHasVotedThisCycle(!!hasExistingVotes);

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

        // Set up periodic refreshing of vote data (every 30 seconds)
        const interval = setInterval(async () => {
            try {
                const [talliesRes] = await Promise.all([
                    apiCall(`/party/${partyId}/votes/tallies`)
                ]);
                setVoteTallies(talliesRes);
            } catch (err) {
                console.error('Error refreshing vote tallies:', err);
            }
        }, 30000);

        return () => clearInterval(interval);
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

            // Update vote state from server (in case user voted from another device)
            setSelectedChairVote(votesRes.chair_vote_user_id ? votesRes.chair_vote_user_id.toString() : '');
            setSelectedViceChairVote(votesRes.vice_chair_vote_user_id ? votesRes.vice_chair_vote_user_id.toString() : '');
            setSelectedTreasurerVote(votesRes.treasurer_vote_user_id ? votesRes.treasurer_vote_user_id.toString() : '');

            // Update voting status
            const hasExistingVotes = votesRes.chair_vote_user_id || votesRes.vice_chair_vote_user_id || votesRes.treasurer_vote_user_id;
            setHasVotedThisCycle(!!hasExistingVotes);
        } catch (err) {
            console.error('Error refreshing data:', err);
        }
    };

    const handleManualRefresh = async () => {
        setVoteSubmissionMessage('Refreshing vote data...');
        await refreshData();
        setVoteSubmissionMessage('Vote data refreshed!');
        setTimeout(() => setVoteSubmissionMessage(''), 2000);
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
        setIsSubmittingVotes(true);
        setVoteSubmissionMessage('');
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
            
            // Update vote submission state
            setHasVotedThisCycle(true);
            setLastVoteSubmissionTime(new Date());
            setVoteSubmissionMessage(hasVotedThisCycle ? 'Votes updated successfully!' : 'Votes submitted successfully!');
            
            // Refresh data to get updated votes and tallies
            await refreshData();
            setError(null); // Clear previous errors
            
            // Refresh party details (might show updated leadership if election processed)
            const partyRes = await apiCall(`/party/${partyId}`);
            setPartyDetails(partyRes);
        } catch (err) {
            setError(err.message || 'Failed to submit vote');
            setVoteSubmissionMessage('');
        } finally {
            setIsSubmittingVotes(false);
        }
    };

    const getVoteCount = (position, candidateId) => {
        const tallies = voteTallies[position] || [];
        const tally = tallies.find(t => t.candidate_id === candidateId);
        return tally ? tally.vote_count : 0;
    };

    // Calculate total votes cast for a specific position
    const getTotalVotesForPosition = (position) => {
        const tallies = voteTallies[position] || [];
        return tallies.reduce((total, tally) => total + tally.vote_count, 0);
    };

    // Calculate percentage of votes for a candidate within their position
    const getVotePercentage = (position, candidateId) => {
        const candidateVotes = getVoteCount(position, candidateId);
        const totalPositionVotes = getTotalVotesForPosition(position);
        
        if (totalPositionVotes === 0) return 0;
        return Math.round((candidateVotes / totalPositionVotes) * 100);
    };

    const handleSetPartyDues = async (e) => {
        e.preventDefault();
        setIsSettingDues(true);
        setDuesMessage('');
        try {
            await apiCall(`/party/${partyId}/dues`, {
                method: 'POST',
                body: JSON.stringify({
                    partyId: parseInt(partyId),
                    duesPercentage: parseInt(newDuesPercentage)
                })
            });
            
            setDuesMessage(`Party dues successfully set to ${newDuesPercentage}%`);
            setNewDuesPercentage(0);
            
            // Refresh party details
            const partyRes = await apiCall(`/party/${partyId}`);
            setPartyDetails(partyRes);
            
        } catch (err) {
            setDuesMessage(`Error: ${err.message || 'Failed to set party dues'}`);
        } finally {
            setIsSettingDues(false);
        }
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
                        <p className="font-semibold">Party Dues:</p>
                        <p>{partyDetails.dues_percentage || 0}% of hourly income</p>
                        <p className="text-xs text-gray-600">Collected automatically from member income</p>
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

            {/* Leadership Candidacy Form - Only show if user has candidacies */}
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

            {/* Leadership Candidacy Form - Only show if user can run for additional positions */}
            {availablePositions.length > 0 && userCandidacies.length === 0 && (
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

            {/* Help text when user has no candidacies and no available positions */}
            {availablePositions.length === 0 && userCandidacies.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Leadership Candidacy</h3>
                    <p className="text-gray-600">You are currently running for all available leadership positions in this election cycle.</p>
                </div>
            )}

            {/* Party Dues Management - Only show for party chair */}
            {isPartyLeader && currentUser && partyDetails && partyDetails.chair_user_id === currentUser.id && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Party Dues Management</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Set the percentage of hourly income that party members contribute to the party treasury. 
                        Maximum 20%. Dues are collected automatically every hour.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Current Settings</h4>
                        <p className="text-blue-700">
                            Party dues: <span className="font-semibold">{partyDetails.dues_percentage || 0}%</span> of member hourly income
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Example: A member earning $5,000/hour would contribute ${Math.floor(5000 * ((partyDetails.dues_percentage || 0) / 100)).toLocaleString()}/hour to the party treasury.
                        </p>
                    </div>

                    {duesMessage && (
                        <div className={`mb-4 p-3 rounded-lg ${duesMessage.startsWith('Error') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                            <p className={duesMessage.startsWith('Error') ? 'text-red-800' : 'text-green-800'}>{duesMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSetPartyDues} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                New Dues Percentage (0-20%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="20"
                                value={newDuesPercentage}
                                onChange={(e) => setNewDuesPercentage(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter a percentage between 0 and 20. This will affect all party members' hourly income.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSettingDues}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSettingDues ? 'Setting Dues...' : 'Set Party Dues'}
                        </button>
                    </form>
                </div>
            )}

            {/* Leadership Election Voting Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">Party Leadership Election</h3>
                    <button
                        onClick={handleManualRefresh}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                        title="Refresh vote data"
                    >
                        🔄 Refresh
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-1">Voting for the week of: <span className="font-semibold">{electionCycleDateDisplay}</span></p>
                <p className="text-xs text-blue-700 mb-2">Voting closes: <span className="font-semibold">{electionCycleEndDisplay}</span>. Results are applied at the start of next week.</p>
                <p className="text-xs text-gray-600 mb-4">Total eligible voters: <span className="font-semibold">{voteTallies.total_eligible_voters}</span></p>
                
                {/* Voting Status Indicator */}
                {hasVotedThisCycle && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-green-800 font-medium">
                                You have voted in this election cycle
                            </span>
                        </div>
                        {lastVoteSubmissionTime && (
                            <p className="text-xs text-green-600 mt-1">
                                Last updated: {lastVoteSubmissionTime.toLocaleString()}
                            </p>
                        )}
                        <p className="text-xs text-green-600 mt-1">
                            You can change your votes anytime before voting closes.
                        </p>
                    </div>
                )}
                
                {/* Success Message */}
                {voteSubmissionMessage && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 font-medium">{voteSubmissionMessage}</p>
                    </div>
                )}
                
                {candidates.length === 0 ? (
                    <p className="text-gray-500">No candidates have run for leadership positions in the current election cycle.</p>
                ) : (
                    <form onSubmit={handleLeadershipVote} className="space-y-6">
                        {['chair', 'vice_chair', 'treasurer'].map((position) => {
                            const positionCandidates = candidates.filter(
                                (c) => c.position_contested === position
                            );
                            const totalPositionVotes = getTotalVotesForPosition(position);
                            let currentVote, setCurrentVote;
                            if (position === 'chair') { currentVote = selectedChairVote; setCurrentVote = setSelectedChairVote; }
                            else if (position === 'vice_chair') { currentVote = selectedViceChairVote; setCurrentVote = setSelectedViceChairVote; }
                            else { currentVote = selectedTreasurerVote; setCurrentVote = setSelectedTreasurerVote; }

                            return (
                                <div key={position}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold capitalize text-gray-700">
                                            Vote for {position.replace('_', ' ')}
                                        </h4>
                                        {totalPositionVotes > 0 && (
                                            <span className="text-sm text-gray-500">
                                                {totalPositionVotes} vote{totalPositionVotes !== 1 ? 's' : ''} cast
                                            </span>
                                        )}
                                    </div>
                                    {positionCandidates.length === 0 ? (
                                        <p className="text-sm text-gray-500">No candidates for this position.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className={`flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-100 cursor-pointer ${
                                                currentVote === "" ? 'bg-blue-50 border-blue-300' : ''
                                            }`}>
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
                                                const votePercentage = getVotePercentage(position, candidate.user_id);
                                                const isSelected = currentVote === candidate.user_id.toString();
                                                return (
                                                    <label key={candidate.id} className={`flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 cursor-pointer ${
                                                        isSelected ? 'bg-blue-50 border-blue-300' : ''
                                                    }`}>
                                                        <div className="flex items-center space-x-2">
                                                            <input 
                                                                type="radio" 
                                                                name={position} 
                                                                value={candidate.user_id} 
                                                                checked={isSelected} 
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
                                                            {isSelected && (
                                                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                                                    Your Vote
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-semibold text-blue-600">
                                                                {voteCount} vote{voteCount !== 1 ? 's' : ''}
                                                            </span>
                                                            {totalPositionVotes > 0 && (
                                                                <span className="text-xs text-gray-500">
                                                                    ({votePercentage}%)
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
                                disabled={isSubmittingVotes}
                                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Clear All Votes
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={candidates.length === 0 || isSubmittingVotes}
                            >
                                {isSubmittingVotes ? 'Submitting...' : hasVotedThisCycle ? 'Update Votes' : 'Submit Votes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PartyManagement; 