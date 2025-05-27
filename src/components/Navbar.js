// frontend/src/components/Navbar.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DollarSign, TrendingUp, Briefcase, Timer, MapPin } from 'lucide-react'; // Added MapPin

export default function Navbar({ currentUser, logout }) {
  const navLinkStyles = ({ isActive }) => ({
    color: isActive ? '#60a5fa' : '#9ca3af', // text-blue-400 or text-gray-400
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <header className="bg-gray-800 p-4 rounded-lg mb-6 flex justify-between items-center shadow-lg flex-wrap">
      <div className="flex items-center space-x-6 mb-2 md:mb-0">
        <Link to="/" className="text-2xl font-bold text-blue-400">Political Arena</Link>
        <nav className="flex items-center space-x-4">
          <NavLink to="/" style={navLinkStyles}>Home</NavLink>
          {currentUser && currentUser.home_state && ( // Check if home_state exists
            <NavLink 
              to={`/state/${encodeURIComponent(currentUser.home_state)}`} 
              style={navLinkStyles}
              className="flex items-center"
            >
              <MapPin size={16} className="mr-1"/> {currentUser.home_state}
            </NavLink>
          )}
          <NavLink to="/map" style={navLinkStyles}>USA Map</NavLink>
          <NavLink to="/profile" style={navLinkStyles}>Profile</NavLink>
        </nav>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        {currentUser && (
          <>
            <div className="text-xs sm:text-sm text-gray-300" title="Approval Rating"><TrendingUp className="inline-block text-green-400" size={16}/> {currentUser.approval_rating}%</div>
            <div className="text-xs sm:text-sm text-gray-300" title="Campaign Funds"><DollarSign className="inline-block text-yellow-400"  size={16}/> ${currentUser.campaign_funds.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-gray-300" title="Political Capital"><Briefcase className="inline-block text-purple-400"  size={16}/> {currentUser.political_capital}</div>
            <div className="text-xs sm:text-sm text-gray-300" title="Action Points"><Timer className="inline-block text-red-400"  size={16}/> {currentUser.action_points}</div>
            <button onClick={logout} className="bg-red-600 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-red-700">Logout</button>
          </>
        )}
      </div>
    </header>
  );
}