// frontend/src/components/Navbar.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DollarSign, TrendingUp, Briefcase, Timer, MapPin, CalendarDays } from 'lucide-react'; // Added CalendarDays

// This is the main navigation bar for the application.
// It receives the currentUser, logout function, and gameDate as props.
export default function Navbar({ currentUser, logout, gameDate }) {
  const navLinkStyles = ({ isActive }) => ({
    color: isActive ? '#60a5fa' : '#9ca3af', // text-blue-400 or text-gray-400
    fontWeight: isActive ? 'bold' : 'normal',
    whiteSpace: 'nowrap', // Prevent nav links from wrapping
  });

  const formatGameDate = (date) => {
    if (!date || !date.year || !date.month || !date.day) return "Loading Game Date...";
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    return `${monthNames[date.month - 1]} ${date.day}, ${date.year}`;
  };

  return (
    <header className="bg-gray-800 p-3 sm:p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center ">
        {/* Top Part: Logo and Main Navigation */}
        <div className="flex justify-between items-center w-full sm:w-auto mb-3 sm:mb-0">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-400">Political Arena</Link>
            <nav className="flex items-center space-x-2 sm:space-x-4 ml-4 sm:ml-6">
            <NavLink to="/" style={navLinkStyles} className="text-sm sm:text-base">Home</NavLink>
            {currentUser && currentUser.home_state && (
                <NavLink 
                to={`/state/${encodeURIComponent(currentUser.home_state)}`} 
                style={navLinkStyles}
                className="flex items-center text-sm sm:text-base"
                >
                <MapPin size={14} className="mr-1 hidden sm:inline-block"/> {currentUser.home_state}
                </NavLink>
            )}
            <NavLink to="/map" style={navLinkStyles} className="text-sm sm:text-base">USA Map</NavLink>
            <NavLink to="/profile" style={navLinkStyles} className="text-sm sm:text-base">Profile</NavLink>
            </nav>
        </div>

        {/* Right Part: Stats, Game Date, Logout */}
        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
            {currentUser && (
            <>
                {/* Game Date Display */}
                {gameDate && (
                <div className="text-xs text-amber-300 mb-1.5 sm:mb-1 flex items-center whitespace-nowrap" title="Current In-Game Date">
                    <CalendarDays size={14} className="inline-block mr-1" /> GAME DATE: {formatGameDate(gameDate)}
                </div>
                )}
                <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-xs text-gray-300 whitespace-nowrap" title="Approval Rating"><TrendingUp className="inline-block text-green-400" size={14}/> {currentUser.approval_rating}%</div>
                <div className="text-xs text-gray-300 whitespace-nowrap" title="Campaign Funds"><DollarSign className="inline-block text-yellow-400"  size={14}/> ${currentUser.campaign_funds.toLocaleString()}</div>
                <div className="text-xs text-gray-300 whitespace-nowrap" title="Political Capital"><Briefcase className="inline-block text-purple-400"  size={14}/> {currentUser.political_capital}</div>
                <div className="text-xs text-gray-300 whitespace-nowrap" title="Action Points"><Timer className="inline-block text-red-400"  size={14}/> {currentUser.action_points}</div>
                <button onClick={logout} className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700 whitespace-nowrap">Logout</button>
                </div>
            </>
            )}
        </div>
      </div>
    </header>
  );
}
