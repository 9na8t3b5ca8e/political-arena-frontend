// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Target, BarChart2 } from 'lucide-react';
import { apiCall } from '../api';

export default function HomePage({ currentUser, setCurrentUser }) {
  const [activeElections, setActiveElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [pollingData, setPollingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLobbyData = async () => {
      try {
        const elections = await apiCall('/elections');
        setActiveElections(elections);
      } catch (error) { setError('Failed to load election data. Please refresh.'); }
    };

    loadLobbyData();
    const interval = setInterval(loadLobbyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewElection = async (electionId) => {
    if (selectedElection && selectedElection.id === electionId) {
        setSelectedElection(null);
        return;
    }
    try {
        setLoading(true);
        const electionDetails = await apiCall(`/elections/${electionId}`);
        setSelectedElection(electionDetails);
        setPollingData([]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  
  const handleViewPolling = async (electionId) => {
      try {
          setLoading(true);
          const polling = await apiCall(`/elections/${electionId}/polling`);
          setPollingData(polling);
      } catch(err) { setError(err.message)}
      finally {setLoading(false); }
  }

  const handleAttackAd = async (targetUserId) => {
    try {
        setLoading(true); setError('');
        const res = await apiCall('/actions/attack', { method: 'POST', body: JSON.stringify({targetUserId}) });
        setCurrentUser(prev => ({...prev, campaign_funds: res.newFunds, action_points: res.newAP }));
        alert(res.message);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  
  const handleFundraise = async (type) => {
    try {
        setLoading(true); setError('');
        const res = await apiCall('/actions/fundraise', { method: 'POST', body: JSON.stringify({type}) });
        setCurrentUser(prev => ({ ...prev, ...res.newStats}));
        alert(res.message);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg" onClick={() => setError('')}>Error: {error}</div>}
        <ElectionsList elections={activeElections} onSelect={handleViewElection} selectedId={selectedElection?.id} />
        {loading && <p>Loading details...</p>}
        {selectedElection && <ElectionDetails election={selectedElection} currentUser={currentUser} onAttack={handleAttackAd} onPolling={handleViewPolling} pollingData={pollingData} setError={setError} />}
      </div>
      <div className="space-y-6">
        <Fundraising onFundraise={handleFundraise} />
      </div>
    </div>
  );
}

const ElectionsList = ({ elections, onSelect, selectedId }) => {
    const formatTime = (deadline) => {
        const diff = new Date(deadline) - new Date();
        if (diff < 0) return "Closed";
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Active Elections</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {elections.map(e => (
                    <div key={e.id} onClick={() => onSelect(e.id)} className={`p-3 rounded-lg cursor-pointer ${selectedId === e.id ? 'bg-blue-500/30 border-blue-400 border' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
                        <div className="flex justify-between">
                            <span className="font-bold">{e.office}, {e.state}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.type === 'primary' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{e.type.charAt(0).toUpperCase() + e.type.slice(1)}</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Filing Closes: {formatTime(e.filing_deadline)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ElectionDetails = ({ election, currentUser, onAttack, onPolling, pollingData, setError }) => {
    const [isFiling, setIsFiling] = useState(false);
    const userIsCandidate = election.candidates.some(c => c.user_id === currentUser.id);

    const handleFile = async () => {
        setIsFiling(true); setError('');
        try {
            const res = await apiCall(`/elections/${election.id}/file`, {method: 'POST'});
            alert(res.message);
        } catch(err) { setError(err.message); }
        finally{ setIsFiling(false); }
    }

    return(
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">{election.office}, {election.state} - Details</h3>
            <div className="space-y-3">
                <p><span className="font-semibold">Status:</span> {election.status}</p>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                    <h4 className="font-bold mb-2">Candidates ({election.candidates.length})</h4>
                    <ul className="space-y-2">
                        {election.candidates.map(c => (
                            <li key={c.user_id} className="flex justify-between items-center">
                                <span>{c.first_name} {c.last_name} ({c.username}) - {c.party}</span>
                                {currentUser.id !== c.user_id && election.status === 'campaign_active' && (
                                    <button onClick={() => onAttack(c.user_id)} className="text-xs bg-red-500/50 px-2 py-1 rounded hover:bg-red-500/80"><Target size={14} className="inline"/> Attack</button>
                                )}
                            </li>
                        ))}
                    </ul>
                 </div>
                 {pollingData.length > 0 && (
                     <div className="bg-gray-700/50 p-3 rounded-lg">
                        <h4 className="font-bold mb-2">Latest Polling</h4>
                        <ul className="space-y-1">
                            {pollingData.map(p => (
                                <li key={p.user_id}>{p.username}: {p.percentage}%</li>
                            ))}
                        </ul>
                     </div>
                 )}
                 <div className="flex space-x-2">
                    {election.status === 'accepting_candidates' && !userIsCandidate && (
                        <button onClick={handleFile} disabled={isFiling} className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-500">{isFiling ? 'Filing...' : 'File for Election'}</button>
                    )}
                    {election.status === 'campaign_active' && (
                        <button onClick={() => onPolling(election.id)} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"><BarChart2 size={16} className="inline"/> View Polling</button>
                    )}
                 </div>
            </div>
        </div>
    )
}

const Fundraising = ({ onFundraise }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Actions</h3>
        <div className="space-y-2">
            <button onClick={() => onFundraise('grassroots')} className="w-full text-left p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30">
                <div className="font-bold">Grassroots Fundraising</div>
                <div className="text-sm text-gray-300">+$2,500, +1% Approval. Costs 15 AP.</div>
            </button>
             <button onClick={() => onFundraise('major_donor')} className="w-full text-left p-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30">
                <div className="font-bold">Meet Major Donors</div>
                <div className="text-sm text-gray-300">+$15,000, -2% Approval. Costs 25 AP. (Req: 40% AR)</div>
            </button>
             <button onClick={() => onFundraise('pac')} className="w-full text-left p-3 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30">
                <div className="font-bold">Seek PAC Contribution</div>
                <div className="text-sm text-gray-300">+$25,000, -5% Approval. Costs 5 AP & 5 PC. (Req: 10 PC)</div>
            </button>
        </div>
    </div>
);