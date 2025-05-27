// frontend/src/pages/HomePage.js
import React, { useState } from 'react'; // Removed useEffect
// Removed Target, BarChart2 as election details are moving
// Removed apiCall as data fetching is moving or changing scope

export default function HomePage({ currentUser, setCurrentUser }) { // Pass setCurrentUser
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // For fundraising actions

  // Fundraising logic remains similar, ensure setCurrentUser is passed if needed for updates
  const handleFundraise = async (type) => {
    try {
        setLoading(true); setError('');
        const res = await apiCall('/actions/fundraise', { method: 'POST', body: JSON.stringify({type}) });
        setCurrentUser(prev => ({ ...prev, ...res.newStats})); // Make sure setCurrentUser is available
        alert(res.message);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg" onClick={() => setError('')}>Error: {error}</div>}

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-300 mb-4">Welcome, {currentUser.first_name}!</h2>
        <p className="text-gray-400">This is your central dashboard. Key information about your political career and active campaigns you're in will appear here soon.</p>
        <p className="text-gray-400 mt-2">Use the navigation bar to explore states, view the national map, or manage your profile.</p>
        {/* TODO: Add "My Active Campaigns" section here later */}
      </div>

      <Fundraising onFundraise={handleFundraise} /> 
      {/* Keep Fundraising, or decide if it moves to a specific "Campaign HQ" page later */}
    </div>
  );
}

// Fundraising sub-component (can stay here or move to components folder)
const Fundraising = ({ onFundraise }) => ( // Removed apiCall import if not used directly here
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="font-bold text-lg mb-3 text-blue-200 border-b border-gray-700 pb-2">Actions</h3>
        <div className="space-y-2">
            <button onClick={() => onFundraise('grassroots')} className="w-full text-left p-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors duration-150">
                <div className="font-bold text-gray-100">Grassroots Fundraising</div>
                <div className="text-sm text-gray-400">+$2,500, +1% Approval. Costs 15 AP.</div>
            </button>
             <button onClick={() => onFundraise('major_donor')} className="w-full text-left p-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-colors duration-150">
                <div className="font-bold text-gray-100">Meet Major Donors</div>
                <div className="text-sm text-gray-400">+$15,000, -2% Approval. Costs 25 AP. (Req: 40% AR)</div>
            </button>
             <button onClick={() => onFundraise('pac')} className="w-full text-left p-3 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 transition-colors duration-150">
                <div className="font-bold text-gray-100">Seek PAC Contribution</div>
                <div className="text-sm text-gray-400">+$25,000, -5% Approval. Costs 5 AP & 5 PC. (Req: 10 PC)</div>
            </button>
        </div>
    </div>
);