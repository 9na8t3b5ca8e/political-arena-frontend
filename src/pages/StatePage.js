// frontend/src/pages/StatePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiCall } from '../api';
import CandidateFinanceWidget from '../components/CandidateFinanceWidget'; // Import the new component
import { Target, BarChart2, LogOut, CheckCircle, XCircle, Award, DollarSign } from 'lucide-react';
import { stanceScale } from '../state-data'; 

// Helper function to get the descriptive label
const getStanceLabel = (value) => stanceScale.find(s => s.value === parseInt(value,10))?.label || 'Moderate';

// Helper to get a color class based on stance value for the bar
const getStanceBarColorClass = (value) => {
    const intValue = parseInt(value, 10);
    if (intValue <= 2) return 'bg-blue-600';
    if (intValue === 3) return 'bg-blue-400';
    if (intValue === 4) return 'bg-purple-500';
    if (intValue === 5) return 'bg-red-400';
    if (intValue >= 6) return 'bg-red-600';
    return 'bg-gray-500';
};

export default function StatePage({ currentUser, setCurrentUser }) {
  const { stateName } = useParams();
  const decodedStateName = decodeURIComponent(stateName);

  const [stateDetails, setStateDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedElection, setSelectedElection] = useState(null);
  const [pollingData, setPollingData] = useState(null);
  const [loadingElectionDetails, setLoadingElectionDetails] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  const [selectedCandidateForFinance, setSelectedCandidateForFinance] = useState(null);


  const fetchStateData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const data = await apiCall(`/states/${encodeURIComponent(decodedStateName)}`);
      setStateDetails(data);
    } catch (err) {
      setError(`Failed to load data for ${decodedStateName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [decodedStateName]);

  useEffect(() => {
    fetchStateData();
  }, [fetchStateData]);

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  }

  const formatTime = (deadlineISOString) => {
    if (!deadlineISOString) return { relative: "N/A", absolute: "N/A", hasPassed: true};
    const deadline = new Date(deadlineISOString);
    const now = new Date();
    const diff = deadline - now;

    let relativeString = "Closed";
    let hasPassed = true;

    if (diff > 0) {
        hasPassed = false;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        if (days > 0) relativeString = `${days}d ${hours}h ${minutes}m left`;
        else if (hours > 0) relativeString = `${hours}h ${minutes}m left`;
        else if (minutes > 0) relativeString = `${minutes}m left`;
        else relativeString = "<1m left";
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' };
    const absoluteString = deadline.toLocaleString(undefined, options);

    return { relative: relativeString, absolute: absoluteString, hasPassed };
  };

  const handleViewElection = async (electionId) => {
    clearMessages();
    setSelectedCandidateForFinance(null);
    if (selectedElection && selectedElection.id === electionId) {
        setSelectedElection(null);
        setPollingData(null);
        return;
    }
    try {
        setLoadingElectionDetails(true);
        const electionDetailsResult = await apiCall(`/elections/${electionId}`);
        setSelectedElection(electionDetailsResult);
        setPollingData(null);
    } catch (err) { setError(err.message); }
    finally { setLoadingElectionDetails(false); }
  };
  
  const handleToggleFinance = (candidateId) => {
    if(selectedCandidateForFinance === candidateId) {
        setSelectedCandidateForFinance(null);
    } else {
        setSelectedCandidateForFinance(candidateId);
    }
  }

  const handleViewPolling = async (electionId) => {
      clearMessages();
      try {
          setLoadingElectionDetails(true);
          const polling = await apiCall(`/elections/${electionId}/polling`);
          setPollingData(polling);
      } catch(err) { setError(err.message); }
      finally { setLoadingElectionDetails(false); }
  };

  const handleAttackAd = async (targetUserId) => {
    clearMessages();
    try {
        setIsProcessingAction(true);
        const res = await apiCall('/actions/attack', { method: 'POST', body: JSON.stringify({targetUserId}) });
        setCurrentUser(prev => ({...prev, campaign_funds: res.newFunds, action_points: res.newAP }));
        setSuccessMessage(res.message);
    } catch (err) { setError(err.message); }
    finally { setIsProcessingAction(false); }
  };

  const handleSupport = async (targetElectionCandidateId) => {
    clearMessages();
    try {
        setIsProcessingAction(true);
        const res = await apiCall('/actions/support-candidate', {
            method: 'POST',
            body: JSON.stringify({ targetElectionCandidateId })
        });
        setCurrentUser(prev => ({
            ...prev,
            action_points: res.newStats.action_points,
            political_capital: res.newStats.political_capital
        }));
        setSuccessMessage(res.message);
        
        // Refresh election data to show updated approval ratings
        if (selectedElection) {
            const electionDetailsResult = await apiCall(`/elections/${selectedElection.id}`);
            setSelectedElection(electionDetailsResult);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setIsProcessingAction(false);
    }
  };

  const handleFileForElection = async (electionId, filingFee) => {
      clearMessages();
      setIsProcessingAction(true);
      try {
          if (currentUser.home_state !== decodedStateName) {
              throw new Error("You can only file for elections in your home state.");
          }
          if (currentUser.campaign_funds < filingFee) {
              throw new Error(`Insufficient funds. Filing fee: $${filingFee?.toLocaleString()}. Your funds: $${currentUser.campaign_funds.toLocaleString()}`);
          }
          const res = await apiCall(`/elections/${electionId}/file`, { method: 'POST' });
          setSuccessMessage(res.message);
          setCurrentUser(prev => ({...prev, campaign_funds: res.newCampaignFunds !== undefined ? res.newCampaignFunds : prev.campaign_funds - filingFee}));

          // Refresh data
          await fetchStateData();
          if(selectedElection && selectedElection.id === electionId){
             const electionDetailsResult = await apiCall(`/elections/${electionId}`);
             setSelectedElection(electionDetailsResult);
          }
      } catch (err) {
          setError(err.message);
      } finally {
          setIsProcessingAction(false);
      }
  };

  const handleWithdrawFromElection = async (electionId) => {
    clearMessages();
    if (!window.confirm("Are you sure you want to withdraw from this election? The filing fee will be refunded if filing is still open.")) {
        return;
    }
    setIsProcessingAction(true);
    try {
        const res = await apiCall(`/elections/${electionId}/candidate`, { method: 'DELETE' });
        setSuccessMessage(res.message);
        if (res.newCampaignFunds !== undefined) {
            setCurrentUser(prev => ({ ...prev, campaign_funds: res.newCampaignFunds }));
        }
        await fetchStateData();
        if(selectedElection && selectedElection.id === electionId){
           const electionDetailsResult = await apiCall(`/elections/${electionId}`);
           setSelectedElection(electionDetailsResult);
        } else if (selectedElection) {
            const electionDetailsResult = await apiCall(`/elections/${selectedElection.id}`);
            setSelectedElection(electionDetailsResult);
        }

    } catch (err) {
        setError(err.message);
    } finally {
        setIsProcessingAction(false);
    }
  };

  const electionsByOffice = stateDetails?.active_elections?.reduce((acc, election) => {
      const key = `${election.office}-${election.election_year}`;
      if (!acc[key]) {
          acc[key] = {
              title: `${election.office} (${election.election_year})`,
              type: election.type,
              elections: []
          };
      }
      acc[key].elections.push(election);
      return acc;
  }, {});

  const sortedElectionGroups = Object.values(electionsByOffice || {}).sort((a,b) => {
    if (a.elections[0].type === 'general' && b.elections[0].type !== 'general') return -1;
    if (b.elections[0].type === 'general' && a.elections[0].type !== 'general') return 1;
    return a.title.localeCompare(b.title);
  });

  if (loading && !stateDetails) return <div className="text-center py-10 text-gray-400">Loading state data for {decodedStateName}...</div>;
  if (error && !stateDetails && !loading) return <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>;
  if (!stateDetails && !loading) return <div className="text-center py-10 text-gray-400">No data currently available for {decodedStateName}.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-300 mb-4">Welcome to {decodedStateName}</h2>
      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 flex justify-between items-center"><span><XCircle size={18} className="inline mr-2"/>{error}</span><button onClick={clearMessages} className="text-red-300 hover:text-red-100">&times;</button></div>}
      {successMessage && <div className="bg-green-500/20 text-green-300 p-3 rounded-lg mb-4 flex justify-between items-center"><span><CheckCircle size={18} className="inline mr-2"/>{successMessage}</span><button onClick={clearMessages} className="text-green-200 hover:text-green-100">&times;</button></div>}

      {stateDetails && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              style={{ width: `${((parseInt(stateDetails.ideology.economic,10) - 1) / 6) * 100}%` }}
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
                              style={{ width: `${((parseInt(stateDetails.ideology.social,10) - 1) / 6) * 100}%` }}
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

            <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
              <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">Registered Politicians ({stateDetails.registered_politicians?.length || 0})</h3>
              {stateDetails.registered_politicians?.length > 0 ? (
                <ul className="space-y-1 text-gray-400 max-h-60 overflow-y-auto text-sm">
                  {stateDetails.registered_politicians.map(player => (
                    <li key={player.user_id}>
                      <Link to={`/profile/${player.user_id}`} className="hover:text-blue-400">{player.first_name} {player.last_name}</Link> ({player.party}) - {player.current_office || 'Citizen'}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No registered politicians from this state currently active.</p>}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-xl mt-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-200 border-b border-gray-700 pb-2">Active Elections in {decodedStateName}</h3>
            {sortedElectionGroups?.length > 0 ? (
              <div className="space-y-6">
              {sortedElectionGroups.map(group => (
                  <div key={group.title} className="bg-gray-900/50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-100 mb-3 border-b border-gray-700 pb-2 flex items-center">
                          <Award size={20} className="mr-3 text-yellow-400"/>
                          {group.title}
                      </h4>
                      <div className="space-y-4">
                        {group.elections.map(election => {
                          let isUserFiledInThisElection = election.candidates?.some(c => c.user_id === currentUser.id);

                          if (selectedElection && selectedElection.id === election.id) {
                              isUserFiledInThisElection = selectedElection.candidates?.some(c => c.user_id === currentUser.id);
                          }

                          const timeInfo = formatTime(election.filing_deadline);
                          const canFile = currentUser.home_state === decodedStateName && election.status === 'accepting_candidates' && !timeInfo.hasPassed && election.party === currentUser.party;
                          const canWithdraw = isUserFiledInThisElection && election.status === 'accepting_candidates' && !timeInfo.hasPassed;
                          const isGeneralElection = election.type === 'general';

                          return (
                              <div key={election.id} className="bg-gray-700/70 p-4 rounded-md shadow">
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                                      <h5 className="text-md font-medium text-gray-200 capitalize">
                                        {isGeneralElection ? 'General Election' : `${election.party} ${election.type}`}
                                      </h5>
                                      <span className="text-xs mt-1 sm:mt-0 px-2 py-1 bg-gray-600 text-gray-300 rounded-full">{election.status.replace(/_/g, ' ')}</span>
                                  </div>
                                  
                                  {!isGeneralElection && (
                                    <>
                                    <p className="text-sm text-gray-400 mb-1">
                                      Filing Closes: {timeInfo.relative}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        ({timeInfo.absolute})
                                    </p>
                                    </>
                                  )}

                                  <div className="flex flex-wrap gap-2 items-center">
                                      {!isGeneralElection && canFile && !isUserFiledInThisElection && (
                                          <button
                                              onClick={() => handleFileForElection(election.id, election.filing_fee)}
                                              disabled={isProcessingAction}
                                              className="bg-green-600 text-xs px-3 py-1.5 rounded hover:bg-green-700 disabled:bg-gray-500 flex items-center"
                                          >
                                              {isProcessingAction ? 'Processing...' : `File ($${election.filing_fee?.toLocaleString() || '0'})`}
                                          </button>
                                      )}
                                      {isUserFiledInThisElection && (
                                          <span className="text-xs px-3 py-1.5 rounded bg-green-500/30 text-green-300 flex items-center">
                                              <CheckCircle size={14} className="inline mr-1.5"/> Filed
                                          </span>
                                      )}
                                      {!isGeneralElection && canWithdraw && (
                                          <button
                                              onClick={() => handleWithdrawFromElection(election.id)}
                                              disabled={isProcessingAction}
                                              className="bg-yellow-600 text-xs px-3 py-1.5 rounded hover:bg-yellow-700 disabled:bg-gray-500 flex items-center"
                                          >
                                              <LogOut size={12} className="inline mr-1.5"/>
                                              {isProcessingAction ? 'Processing...' : 'Withdraw'}
                                          </button>
                                      )}
                                      {!isGeneralElection && timeInfo.hasPassed && election.status === 'accepting_candidates' && (
                                          <span className="text-xs px-3 py-1.5 rounded bg-red-500/30 text-red-300">Filing Closed</span>
                                      )}
                                      <button onClick={() => handleViewElection(election.id)} className="text-xs bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-500">
                                          {selectedElection?.id === election.id ? 'Hide Details' : 'View Details'}
                                      </button>
                                  </div>

                                  {selectedElection && selectedElection.id === election.id && (
                                      <div className="mt-4 pt-3 border-t border-gray-600 space-y-3">
                                          {loadingElectionDetails && <p className="text-sm text-gray-400">Loading election details...</p>}
                                          <h6 className="font-semibold text-gray-200 text-sm">Candidates ({selectedElection.candidates?.length || 0}):</h6>
                                          {selectedElection.candidates?.length > 0 ? (
                                              <div className="space-y-2">
                                                  {selectedElection.candidates.map(c => (
                                                    <React.Fragment key={c.user_id}>
                                                      <div className="bg-gray-600/30 p-2 rounded-md">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                            <div className="flex-grow">
                                                                <Link to={`/profile/${c.user_id}`} className="hover:text-blue-400 font-medium">{c.first_name} {c.last_name}</Link>
                                                                <span className="text-gray-400 text-xs"> ({c.party || 'N/A'}) - </span>
                                                                <span className="text-green-400 text-xs">${c.campaign_funds?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex gap-2 items-center mt-1 sm:mt-0">
                                                              <button onClick={() => handleToggleFinance(c.election_candidate_id)} className="text-xs bg-teal-600 px-2 py-1 rounded hover:bg-teal-500">
                                                                <DollarSign size={12} className="inline mr-1"/>Finance
                                                              </button>
                                                              {c.user_id !== currentUser.id && (
                                                                  <div className="flex gap-2">
                                                                      <button
                                                                          onClick={() => handleAttackAd(c.user_id)}
                                                                          disabled={isProcessingAction}
                                                                          className="flex items-center gap-1 px-2 py-1 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded"
                                                                          title="Launch attack ad"
                                                                      >
                                                                          <Target size={16} /> Attack
                                                                      </button>
                                                                      <button
                                                                          onClick={() => handleSupport(c.id)}
                                                                          disabled={isProcessingAction}
                                                                          className="flex items-center gap-1 px-2 py-1 text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded"
                                                                          title="Support campaign"
                                                                      >
                                                                          <CheckCircle size={16} /> Support
                                                                      </button>
                                                                  </div>
                                                              )}
                                                            </div>
                                                        </div>
                                                        {/* FIX: Render the widget here, inside the map, when this candidate is selected */}
                                                        {selectedCandidateForFinance === c.election_candidate_id && (
                                                            <div className="mt-2">
                                                                <CandidateFinanceWidget
                                                                    candidate={c}
                                                                    currentUser={currentUser}
                                                                    setCurrentUser={setCurrentUser}
                                                                    onClose={() => setSelectedCandidateForFinance(null)}
                                                                />
                                                            </div>
                                                        )}
                                                      </div>
                                                    </React.Fragment>
                                                  ))}
                                              </div>
                                          ) : <p className="text-xs text-gray-500 pl-4">{isGeneralElection ? "No candidates have won their primaries yet." : "No candidates have filed yet."}</p>}
                                          
                                          {selectedElection.status === 'campaign_active' && selectedElection.candidates?.length > 0 && (
                                              <button
                                                  onClick={() => handleViewPolling(selectedElection.id)}
                                                  disabled={loadingElectionDetails}
                                                  className="text-xs bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-500 disabled:bg-gray-500 mt-2"
                                              >
                                                  <BarChart2 size={12} className="inline mr-1"/> View Polling
                                              </button>
                                          )}
                                          {pollingData && pollingData.poll_data ? (
                                              <div className="bg-gray-600/40 p-3 rounded-md mt-2">
                                                  <h6 className="font-semibold text-sm mb-1 text-gray-200">
                                                      Poll by: <span className="font-normal">{pollingData.polling_firm}</span>
                                                  </h6>
                                                  <p className="text-xs text-gray-400 mb-2">
                                                      Margin of Error: +/- {pollingData.margin_of_error}%
                                                  </p>
                                                  <ul className="text-sm space-y-1 text-gray-300">
                                                      {pollingData.poll_data.map(p => <li key={p.user_id}>{p.username || `${p.first_name} ${p.last_name}`}: {p.percentage}%</li>)}
                                                  </ul>
                                              </div>
                                          ) : (
                                              pollingData && pollingData.length === 0 && (
                                                  <p className="text-xs text-gray-500 mt-2">No polls available for this election yet.</p>
                                              )
                                          )}
                                      </div>
                                  )}
                              </div>
                          );
                        })}
                      </div>
                  </div>
              ))}
              </div>
            ) : <p className="text-gray-500 text-center py-5">No active elections in {decodedStateName} at this time.</p>}
          </div>
        </>
      )}
    </div>
  );
}