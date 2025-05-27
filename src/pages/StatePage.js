// frontend/src/pages/StatePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiCall } from '../api';
import { Target, BarChart2 } from 'lucide-react';
import { stanceScale } from '../state-data';

// Helper function to get the descriptive label
const getStanceLabel = (value) => stanceScale.find(s => s.value === value)?.label || 'Moderate';

// Helper to get a color class based on stance value for the bar
const getStanceBarColorClass = (value) => {
    if (value <= 2) return 'bg-blue-600'; // Strong Left
    if (value === 3) return 'bg-blue-400'; // Lean Left
    if (value === 4) return 'bg-purple-500'; // Moderate
    if (value === 5) return 'bg-red-400'; // Lean Right
    if (value >= 6) return 'bg-red-600'; // Strong Right
    return 'bg-gray-500';
};

export default function StatePage({ currentUser, setCurrentUser }) {
  const { stateName } = useParams();
  const decodedStateName = decodeURIComponent(stateName);

  const [stateDetails, setStateDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedElection, setSelectedElection] = useState(null);
  const [pollingData, setPollingData] = useState([]);
  const [loadingElectionDetails, setLoadingElectionDetails] = useState(false);
  const [isFiling, setIsFiling] = useState(false);

  useEffect(() => {
    const fetchStateData = async () => {
      setLoading(true);
      setError('');
      setSelectedElection(null); // Reset selected election when state changes
      setPollingData([]);
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
  }, [decodedStateName]);

  const formatTime = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return "Closed";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m left`;
  };

  const handleViewElection = async (electionId) => {
    if (selectedElection && selectedElection.id === electionId) {
        setSelectedElection(null); 
        setPollingData([]);
        return;
    }
    try {
        setLoadingElectionDetails(true);
        const electionDetailsResult = await apiCall(`/elections/${electionId}`);
        setSelectedElection(electionDetailsResult);
        setPollingData([]);
    } catch (err) { setError(err.message); }
    finally { setLoadingElectionDetails(false); }
  };

  const handleViewPolling = async (electionId) => {
      try {
          setLoadingElectionDetails(true); // or a dedicated polling loading state
          const polling = await apiCall(`/elections/${electionId}/polling`);
          setPollingData(polling);
      } catch(err) { setError(err.message); }
      finally { setLoadingElectionDetails(false); }
  };
  
  const handleAttackAd = async (targetUserId) => {
    try {
        // Consider a dedicated loading state for this action
        setError('');
        const res = await apiCall('/actions/attack', { method: 'POST', body: JSON.stringify({targetUserId}) });
        setCurrentUser(prev => ({...prev, campaign_funds: res.newFunds, action_points: res.newAP }));
        alert(res.message);
    } catch (err) { setError(err.message); }
  };
  
  const handleFileForElection = async (electionId, filingFee) => {
      setIsFiling(true); setError('');
      try {
          if (currentUser.home_state !== decodedStateName) {
              throw new Error("You can only file for elections in your home state.");
          }
          if (currentUser.campaign_funds < filingFee) {
              throw new Error(`Insufficient funds. Filing fee: $${filingFee?.toLocaleString()}. Your funds: $${currentUser.campaign_funds.toLocaleString()}`);
          }
          const res = await apiCall(`/elections/${electionId}/file`, { method: 'POST' });
          alert(res.message);
          setCurrentUser(prev => ({...prev, campaign_funds: prev.campaign_funds - filingFee}));
          // Re-fetch state data to update election candidate lists or UI
          const data = await apiCall(`/states/${encodeURIComponent(decodedStateName)}`);
          setStateDetails(data);
          if(selectedElection && selectedElection.id === electionId){ // If details for this election were open, refresh them
             const electionDetailsResult = await apiCall(`/elections/${electionId}`);
             setSelectedElection(electionDetailsResult);
          }

      } catch (err) {
          setError(err.message);
      } finally {
          setIsFiling(false);
      }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading state data for {decodedStateName}...</div>;
  if (error && !stateDetails) return <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>;
  if (!stateDetails) return <div className="text-center py-10 text-gray-400">No data currently available for {decodedStateName}.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-300 mb-4">Welcome to {decodedStateName}</h2>
      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4" onClick={() => setError('')}>Error: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* State Info Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">State Overview</h3>
          {stateDetails.ideology && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-200 mb-2">State Ideology:</h4>
              <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300 text-sm">Economic:</span>
                      <span className={`font-medium text-sm ${getStanceBarColorClass(stateDetails.ideology.economic).replace('bg-', 'text-')}`}>
                          {getStanceLabel(stateDetails.ideology.economic)}
                      </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3" title={`Score: ${stateDetails.ideology.economic}`}>
                      <div 
                          className={`${getStanceBarColorClass(stateDetails.ideology.economic)} h-3 rounded-full transition-all duration-500 ease-out`} 
                          style={{ width: `${((stateDetails.ideology.economic - 1) / 6) * 100}%` }}
                      ></div>
                  </div>
              </div>
              <div>
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300 text-sm">Social:</span>
                      <span className={`font-medium text-sm ${getStanceBarColorClass(stateDetails.ideology.social).replace('bg-', 'text-')}`}>
                          {getStanceLabel(stateDetails.ideology.social)}
                      </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3" title={`Score: ${stateDetails.ideology.social}`}>
                      <div 
                          className={`${getStanceBarColorClass(stateDetails.ideology.social)} h-3 rounded-full transition-all duration-500 ease-out`} 
                          style={{ width: `${((stateDetails.ideology.social - 1) / 6) * 100}%` }}
                      ></div>
                  </div>
              </div>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-200 mb-1">Party Strength (PSO):</h4>
            <p className="text-gray-400 text-sm">Democrat: {stateDetails.pso?.democrat !== undefined ? stateDetails.pso.democrat : 'N/A'}</p>
            <p className="text-gray-400 text-sm">Republican: {stateDetails.pso?.republican !== undefined ? stateDetails.pso.republican : 'N/A'}</p>
          </div>
        </div>

        {/* Registered Politicians Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">Registered Politicians ({stateDetails.registered_politicians?.length || 0})</h3>
          {stateDetails.registered_politicians?.length > 0 ? (
            <ul className="space-y-1 text-gray-400 max-h-60 overflow-y-auto text-sm">
              {stateDetails.registered_politicians.map(player => (
                <li key={player.user_id}>
                  <Link to={`/profile/${player.user_id}`} className="hover:text-blue-400">{player.first_name} {player.last_name}</Link> ({player.party}) - {player.current_office}
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500">No registered politicians from this state currently active.</p>}
        </div>
      </div>
      
      {/* Active Elections Section */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl mt-6">
        <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">Active Elections in {decodedStateName} ({stateDetails.active_elections?.length || 0})</h3>
        {stateDetails.active_elections?.length > 0 ? (
          <div className="space-y-4">
            {stateDetails.active_elections.map(election => {
                const isUserFiledInThisElection = selectedElection?.candidates?.some(c => c.user_id === currentUser.id && c.election_id === election.id) ||
                                                 stateDetails.active_elections
                                                    .find(e => e.id === election.id)
                                                    ?.candidates?.some(c => c.user_id === currentUser.id); // Check initial load too

                return (
                    <div key={election.id} className="bg-gray-700/70 p-4 rounded-md shadow">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                            <h4 className="text-lg font-medium text-gray-100">{election.office} <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${election.type === 'primary' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'}`}>{election.type}</span></h4>
                            <span className="text-xs mt-1 sm:mt-0 px-2 py-1 bg-gray-600 text-gray-300 rounded-full">{election.status}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">Filing Closes: {formatTime(election.filing_deadline)}</p>
                        
                        <div className="flex flex-wrap gap-2">
                            {currentUser.home_state === decodedStateName && election.status === 'accepting_candidates' && !isUserFiledInThisElection && (
                                <button 
                                    onClick={() => handleFileForElection(election.id, election.filing_fee)} 
                                    disabled={isFiling}
                                    className="bg-green-600 text-xs px-3 py-1.5 rounded hover:bg-green-700 disabled:bg-gray-500"
                                >
                                    {isFiling ? 'Filing...' : `File ($${election.filing_fee?.toLocaleString() || '0'})`}
                                </button>
                            )}
                             {isUserFiledInThisElection && election.status === 'accepting_candidates' && (
                                <span className="text-xs px-3 py-1.5 rounded bg-green-500/30 text-green-300">Filed</span>
                            )}
                            <button onClick={() => handleViewElection(election.id)} className="text-xs bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-500">
                                {selectedElection?.id === election.id ? 'Hide Details' : 'View Details'}
                            </button>
                        </div>

                        {selectedElection && selectedElection.id === election.id && (
                            <div className="mt-4 pt-3 border-t border-gray-600 space-y-3">
                                {loadingElectionDetails && <p className="text-sm text-gray-400">Loading election details...</p>}
                                <h5 className="font-semibold text-gray-200 text-sm">Candidates ({selectedElection.candidates?.length || 0}):</h5>
                                <ul className="text-xs text-gray-300 list-disc list-inside pl-4 space-y-1">
                                    {selectedElection.candidates?.map(c => (
                                        <li key={c.user_id} className="flex justify-between items-center">
                                            <span>
                                                <Link to={`/profile/${c.user_id}`} className="hover:text-blue-400">{c.first_name} {c.last_name}</Link> ({c.party})
                                            </span>
                                            {currentUser.id !== c.user_id && selectedElection.status === 'campaign_active' && (
                                                <button onClick={() => handleAttackAd(c.user_id)} className="text-xs bg-red-500/50 px-2 py-0.5 rounded hover:bg-red-500/80"><Target size={12} className="inline mr-1"/>Attack</button>
                                            )}
                                        </li>
                                    ))}
                                     {selectedElection.candidates?.length === 0 && <li className="text-gray-500">No candidates have filed yet.</li>}
                                </ul>
                                {selectedElection.status === 'campaign_active' && selectedElection.candidates?.length > 0 && (
                                     <button onClick={() => handleViewPolling(selectedElection.id)} className="text-xs bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-500"><BarChart2 size={12} className="inline mr-1"/> View Polling</button>
                                )}
                                {pollingData.length > 0 && (
                                    <div className="bg-gray-600/40 p-2 rounded-md mt-2">
                                        <h6 className="font-semibold text-xs mb-1 text-gray-200">Polling:</h6>
                                        <ul className="text-xs space-y-0.5 text-gray-300">
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