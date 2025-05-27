// frontend/src/pages/StatePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Link for future use
import { apiCall } from '../api';
import { Target, BarChart2 } from 'lucide-react'; // Assuming these might be used for actions

export default function StatePage({ currentUser, setCurrentUser }) {
  const { stateName } = useParams(); // Gets the state name from the URL
  const decodedStateName = decodeURIComponent(stateName);

  const [stateDetails, setStateDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For a potential selected election within this state page
  const [selectedElection, setSelectedElection] = useState(null);
  const [pollingData, setPollingData] = useState([]);
  const [loadingElectionDetails, setLoadingElectionDetails] = useState(false);


  useEffect(() => {
    const fetchStateData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiCall(`/states/${encodeURIComponent(decodedStateName)}`);
        setStateDetails(data);
      } catch (err) {
        setError(`Failed to load data for ${decodedStateName}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStateData();
  }, [decodedStateName]); // Refetch if the stateName in URL changes

  const formatTime = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return "Closed";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m left`;
  };

  // --- Election Detail & Action Functions (can be refactored later) ---
  const handleViewElection = async (electionId) => {
    if (selectedElection && selectedElection.id === electionId) {
        setSelectedElection(null); return;
    }
    try {
        setLoadingElectionDetails(true);
        const electionDetails = await apiCall(`/elections/${electionId}`);
        setSelectedElection(electionDetails);
        setPollingData([]);
    } catch (err) { setError(err.message); }
    finally { setLoadingElectionDetails(false); }
  };

  const handleViewPolling = async (electionId) => {
      try {
          setLoadingElectionDetails(true);
          const polling = await apiCall(`/elections/${electionId}/polling`);
          setPollingData(polling);
      } catch(err) { setError(err.message); }
      finally { setLoadingElectionDetails(false); }
  };

  const handleAttackAd = async (targetUserId) => {
    try {
        setLoadingElectionDetails(true); setError('');
        const res = await apiCall('/actions/attack', { method: 'POST', body: JSON.stringify({targetUserId}) });
        setCurrentUser(prev => ({...prev, campaign_funds: res.newFunds, action_points: res.newAP }));
        alert(res.message);
    } catch (err) { setError(err.message); }
    finally { setLoadingElectionDetails(false); }
  };

  // File for election logic
  const [isFiling, setIsFiling] = useState(false);
  const handleFileForElection = async (electionId, filingFee) => {
      setIsFiling(true); setError('');
      try {
          if (currentUser.home_state !== decodedStateName) {
              throw new Error("You can only file for elections in your home state.");
          }
          if (currentUser.campaign_funds < filingFee) {
              throw new Error("Insufficient funds to pay the filing fee.");
          }
          const res = await apiCall(`/elections/${electionId}/file`, { method: 'POST' });
          alert(res.message);
          setCurrentUser(prev => ({...prev, campaign_funds: prev.campaign_funds - filingFee}));
          // Optionally, re-fetch state data or election details to show updated candidate list
      } catch (err) {
          setError(err.message);
      } finally {
          setIsFiling(false);
      }
  };


  if (loading) return <div className="text-center py-10">Loading state data for {decodedStateName}...</div>;
  if (error && !stateDetails) return <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>;
  if (!stateDetails) return <div className="text-center py-10">No data available for {decodedStateName}.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-300 mb-4">Welcome to {decodedStateName}</h2>
      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4" onClick={() => setError('')}>Error: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* State Info Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">State Overview</h3>
          {stateDetails.ideology && (
            <div className="mb-3">
              <p className="text-gray-400">Economic Leaning: {stateDetails.ideology.economic} (1=Left, 7=Right)</p>
              <p className="text-gray-400">Social Leaning: {stateDetails.ideology.social} (1=Left, 7=Right)</p>
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-300">Party Strength (PSO):</h4>
            <p className="text-gray-400">Democrat: {stateDetails.pso?.democrat || 'N/A'}</p>
            <p className="text-gray-400">Republican: {stateDetails.pso?.republican || 'N/A'}</p>
          </div>
        </div>

        {/* Registered Politicians Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">Registered Politicians ({stateDetails.registered_politicians?.length || 0})</h3>
          {stateDetails.registered_politicians?.length > 0 ? (
            <ul className="space-y-1 text-gray-400 max-h-60 overflow-y-auto">
              {stateDetails.registered_politicians.map(player => (
                <li key={player.username} className="text-sm">
                  <Link to={`/profile/${player.user_id}`} className="hover:text-blue-400">{player.first_name} {player.last_name}</Link> ({player.party}) - {player.current_office}
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500">No registered politicians from this state currently active.</p>}
        </div>
      </div>

      {/* Active Elections Section */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">Active Elections in {decodedStateName} ({stateDetails.active_elections?.length || 0})</h3>
        {stateDetails.active_elections?.length > 0 ? (
          <div className="space-y-3">
            {stateDetails.active_elections.map(election => {
                const userIsCandidate = selectedElection?.candidates?.some(c => c.user_id === currentUser.id) && selectedElection.id === election.id;
                return (
                    <div key={election.id} className="bg-gray-700/50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-lg font-medium text-gray-100">{election.office} ({election.type})</h4>
                            <span className="text-xs px-2 py-1 bg-blue-500/30 text-blue-300 rounded-full">{election.status}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Filing Closes: {formatTime(election.filing_deadline)}</p>
                        {currentUser.home_state === decodedStateName && election.status === 'accepting_candidates' && !userIsCandidate && (
                            <button 
                                onClick={() => handleFileForElection(election.id, election.filing_fee)} 
                                disabled={isFiling}
                                className="bg-green-600 text-xs px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-500"
                            >
                                {isFiling ? 'Filing...' : `File ($${election.filing_fee?.toLocaleString() || 0})`}
                            </button>
                        )}
                        <button onClick={() => handleViewElection(election.id)} className="ml-2 text-xs bg-gray-600 px-3 py-1 rounded hover:bg-gray-500">
                            {selectedElection?.id === election.id ? 'Hide Details' : 'View Details'}
                        </button>

                        {/* Display selected election details inline */}
                        {selectedElection && selectedElection.id === election.id && (
                            <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                                {loadingElectionDetails && <p>Loading election details...</p>}
                                <h5 className="font-semibold text-sm">Candidates ({selectedElection.candidates?.length || 0}):</h5>
                                <ul className="text-xs list-disc list-inside pl-4">
                                    {selectedElection.candidates?.map(c => (
                                        <li key={c.user_id} className="flex justify-between items-center">
                                            <Link to={`/profile/${c.user_id}`} className="hover:text-blue-400">{c.first_name} {c.last_name}</Link> ({c.party})
                                            {currentUser.id !== c.user_id && selectedElection.status === 'campaign_active' && (
                                                <button onClick={() => handleAttackAd(c.user_id)} className="text-xs bg-red-500/50 px-2 py-0.5 rounded hover:bg-red-500/80"><Target size={12} className="inline"/> Attack</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {selectedElection.status === 'campaign_active' && (
                                     <button onClick={() => handleViewPolling(selectedElection.id)} className="text-xs bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-500"><BarChart2 size={12} className="inline"/> View Polling</button>
                                )}
                                {pollingData.length > 0 && (
                                    <div className="bg-gray-600/30 p-2 rounded-md mt-1">
                                        <h6 className="font-semibold text-xs mb-1">Polling:</h6>
                                        <ul className="text-xs space-y-0.5">
                                            {pollingData.map(p => <li key={p.user_id}>{p.username}: {p.percentage}%</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
          </div>
        ) : <p className="text-gray-500 text-center py-5">No active elections in {decodedStateName} at this time.</p>}
      </div>
    </div>
  );
}