// frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { apiCall } from '../api';
import CampaignActions from '../components/CampaignActions';

// Enhanced Fundraising sub-component with resource validation
const Fundraising = ({ onFundraise, user, loadingFundraise }) => {
    // Check resource requirements for each action
    const canDoGrassroots = user.action_points >= 15;
    const canDoMajorDonor = user.action_points >= 25 && user.approval_rating >= 40;
    const canDoPAC = user.action_points >= 5 && user.political_capital >= 10;

    const getButtonClass = (canDo) => {
        const baseClass = "w-full text-left p-3 rounded-lg transition-colors duration-150";
        if (!canDo) {
            return `${baseClass} bg-gray-700/30 cursor-not-allowed opacity-50`;
        }
        return `${baseClass} hover:bg-blue-600/30`;
    };

    const getGrassrootsClass = () => {
        const baseClass = getButtonClass(canDoGrassroots);
        return canDoGrassroots ? `${baseClass} bg-blue-600/20` : baseClass;
    };

    const getMajorDonorClass = () => {
        const baseClass = getButtonClass(canDoMajorDonor);
        return canDoMajorDonor ? `${baseClass} bg-purple-600/20` : baseClass;
    };

    const getPACClass = () => {
        const baseClass = getButtonClass(canDoPAC);
        return canDoPAC ? `${baseClass} bg-yellow-600/20` : baseClass;
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-3 text-blue-200 border-b border-gray-700 pb-2">Quick Actions</h3>
            <div className="space-y-2">
                <button 
                    onClick={() => canDoGrassroots && onFundraise('grassroots')} 
                    disabled={!canDoGrassroots || loadingFundraise}
                    className={getGrassrootsClass()}
                >
                    <div className="font-bold text-gray-100">Grassroots Fundraising</div>
                    <div className="text-sm text-gray-400">+$2,500, +1% Approval. Costs 15 AP.</div>
                    {!canDoGrassroots && (
                        <div className="text-xs text-red-400 mt-1">
                            Need 15 AP (you have {user.action_points})
                        </div>
                    )}
                </button>
                
                <button 
                    onClick={() => canDoMajorDonor && onFundraise('major_donor')} 
                    disabled={!canDoMajorDonor || loadingFundraise}
                    className={getMajorDonorClass()}
                >
                    <div className="font-bold text-gray-100">Meet Major Donors</div>
                    <div className="text-sm text-gray-400">+$15,000, -2% Approval. Costs 25 AP. (Req: 40% AR)</div>
                    {!canDoMajorDonor && (
                        <div className="text-xs text-red-400 mt-1">
                            {user.action_points < 25 && `Need 25 AP (you have ${user.action_points})`}
                            {user.action_points >= 25 && user.approval_rating < 40 && `Need 40% approval (you have ${user.approval_rating}%)`}
                            {user.action_points < 25 && user.approval_rating < 40 && `Need 25 AP and 40% approval`}
                        </div>
                    )}
                </button>
                
                <button 
                    onClick={() => canDoPAC && onFundraise('pac')} 
                    disabled={!canDoPAC || loadingFundraise}
                    className={getPACClass()}
                >
                    <div className="font-bold text-gray-100">Seek PAC Contribution</div>
                    <div className="text-sm text-gray-400">Gain $25,000, -5% Approval. Cost: 5 AP & 10 PC.</div>
                    {!canDoPAC && (
                        <div className="text-xs text-red-400 mt-1">
                            {user.action_points < 5 && user.political_capital < 10 && `Need 5 AP and 10 PC`}
                            {user.action_points < 5 && user.political_capital >= 10 && `Need 5 AP (you have ${user.action_points})`}
                            {user.action_points >= 5 && user.political_capital < 10 && `Need 10 PC (you have ${user.political_capital})`}
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

// New MiniProfile component with enhanced resource information
const MiniProfile = ({ user }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-100">{user.first_name} {user.last_name}</h2>
                <p className="text-sm text-gray-400">@{user.username}</p>
            </div>
            <Link to="/profile" className="text-blue-400 hover:text-blue-300 text-sm">View Full Profile</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-gray-400 text-sm">Party</p>
                <p className="text-gray-100">{user.party}</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Current Office</p>
                <p className="text-gray-100">{user.current_office}</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Campaign Funds</p>
                <p className="text-gray-100">${user.campaign_funds?.toLocaleString()}</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Political Capital</p>
                <p className="text-gray-100">{user.political_capital} PC</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                    Action Points
                    <span className="text-xs bg-blue-600/20 px-1 rounded" title="Regenerates +10 every hour, max 200">
                        +10/hr
                    </span>
                </p>
                <p className={`text-gray-100 ${user.action_points < 15 ? 'text-yellow-400' : ''}`}>
                    {user.action_points} AP
                    {user.action_points < 15 && <span className="text-xs text-yellow-400 ml-1">(Low)</span>}
                </p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Approval Rating</p>
                <p className="text-gray-100">{user.approval_rating}%</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">State Name Recognition</p>
                <p className="text-gray-100">{user.state_name_recognition}%</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Campaign Strength</p>
                <p className="text-gray-100">{user.campaign_strength}%</p>
            </div>
        </div>
        
        {/* Resource Warning Messages */}
        {(user.action_points < 15 || user.political_capital < 10) && (
            <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                <p className="text-yellow-300 text-sm font-semibold mb-1">Resource Alert:</p>
                <div className="text-yellow-200 text-xs space-y-1">
                    {user.action_points < 15 && (
                        <p>• Low Action Points: Most actions require 15+ AP</p>
                    )}
                    {user.political_capital < 10 && (
                        <p>• Low Political Capital: PAC funding requires 10+ PC</p>
                    )}
                    {user.action_points < 15 && (
                        <p>• AP regenerates +10 every hour (max 200)</p>
                    )}
                </div>
            </div>
        )}
    </div>
);

export default function HomePage({ currentUser, setCurrentUser }) {
  const [myActiveElections, setMyActiveElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [error, setError] = useState('');
  const [loadingFundraise, setLoadingFundraise] = useState(false);


  useEffect(() => {
    const loadMyElections = async () => {
      if (!currentUser) return;
      setLoadingElections(true);
      try {
        const allElections = await apiCall('/elections');
        const filteredElections = allElections.filter(election => 
          election.candidates.some(candidate => candidate.user_id === currentUser.id)
        );
        setMyActiveElections(filteredElections);
      } catch (err) {
        setError('Failed to load your active elections.');
        console.error(err);
      } finally {
        setLoadingElections(false);
      }
    };
    loadMyElections();
    // Optionally, set an interval to refresh this list too
    const interval = setInterval(loadMyElections, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleFundraise = async (type) => {
    try {
        setLoadingFundraise(true); setError('');
        const res = await apiCall('/actions/fundraise', { method: 'POST', body: JSON.stringify({type}) });
        setCurrentUser(prev => ({ ...prev, ...res.newStats}));
        alert(res.message);
    } catch (err) { setError(err.message); }
    finally { setLoadingFundraise(false); }
  };

  const formatTime = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return "Closed";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m left`;
  };

  const handleAction = (newStats) => {
    setCurrentUser(prev => ({ ...prev, ...newStats }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg" onClick={() => setError('')}>Error: {error}</div>}

        <MiniProfile user={currentUser} />

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-blue-300 mb-4">Welcome, {currentUser.first_name}!</h2>
          <p className="text-gray-400">This is your central dashboard. Use the navigation bar to explore states, view the national map, or manage your profile.</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-blue-200 mb-3 border-b border-gray-700 pb-2">My Active Campaigns</h3>
          {loadingElections && <p className="text-gray-400">Loading your campaigns...</p>}
          {!loadingElections && myActiveElections.length === 0 && (
            <p className="text-gray-500">You are not currently running in any active elections. Visit your state page or the USA Map to find elections to join!</p>
          )}
          {!loadingElections && myActiveElections.length > 0 && (
            <div className="space-y-3">
              {myActiveElections.map(election => (
                <div key={election.id} className="bg-gray-700/50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <Link to={`/state/${encodeURIComponent(election.state)}`} className="text-lg font-medium text-gray-100 hover:text-blue-300">
                      {election.office}, {election.state}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${election.type === 'primary' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'}`}>{election.type}</span>
                  </div>
                  <p className="text-sm text-gray-400">Status: {election.status}</p>
                  {election.status === 'accepting_candidates' && <p className="text-sm text-gray-400">Filing Closes: {formatTime(election.filing_deadline)}</p>}
                  {election.status === 'campaign_active' && <p className="text-sm text-gray-400">Election Day: {formatTime(election.election_date)}</p>}
                  {/* Future: Link to a dedicated campaign management page for this election */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Fundraising onFundraise={handleFundraise} user={currentUser} loadingFundraise={loadingFundraise} /> 
        <CampaignActions onAction={handleAction} currentUser={currentUser} />
      </div>
    </div>
  );
}
