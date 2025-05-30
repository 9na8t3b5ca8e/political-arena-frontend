// frontend/src/components/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DollarSign, TrendingUp, Briefcase, Timer, MapPin, CalendarDays, User as UserIcon, Users } from 'lucide-react';

export default function Navbar({ currentUser, logout, gameDate }) {
  const [isPartiesDropdownOpen, setIsPartiesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinkStyles = ({ isActive }) => ({
    color: isActive ? '#60a5fa' : '#9ca3af',
    fontWeight: isActive ? 'bold' : 'normal',
    whiteSpace: 'nowrap',
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPartiesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePartiesDropdown = () => {
    setIsPartiesDropdownOpen(!isPartiesDropdownOpen);
  };

  return (
    <header className="bg-gray-800 p-3 sm:p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center ">
        <div className="flex justify-between items-center w-full sm:w-auto mb-3 sm:mb-0">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-400">Political Arena</Link>
            <nav className="flex items-center space-x-2 sm:space-x-4 ml-4 sm:ml-6">
            <NavLink to="/" style={navLinkStyles} end className="text-sm sm:text-base">Home</NavLink>
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
            {currentUser && <NavLink to={`/profile/${currentUser.id}`} style={navLinkStyles} className="text-sm sm:text-base">Profile</NavLink>}
            {currentUser && (
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={togglePartiesDropdown}
                        style={navLinkStyles({ isActive: false })} 
                        className={`flex items-center text-sm sm:text-base focus:outline-none ${isPartiesDropdownOpen ? 'text-gray-200' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Users size={14} className="mr-1 hidden sm:inline-block"/> Parties <span className={`ml-1 text-xs transition-transform duration-200 ${isPartiesDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    <div className={`absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-20 transition-all duration-200 ease-in-out ${isPartiesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                        <NavLink 
                            to={currentUser.party_id ? `/party/${currentUser.party_id}` : '/party'} 
                            style={navLinkStyles} 
                            className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                            onClick={() => setIsPartiesDropdownOpen(false)}
                        >
                            My Party
                        </NavLink>
                        <NavLink 
                            to="/parties" 
                            style={navLinkStyles} 
                            className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                            onClick={() => setIsPartiesDropdownOpen(false)}
                        >
                            View All Parties
                        </NavLink>
                    </div>
                </div>
            )}
            </nav>
        </div>

        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
            {currentUser && (
            <>
                {gameDate && gameDate.year && (
                <div className="text-xs text-amber-300 mb-1.5 sm:mb-1 flex items-center whitespace-nowrap" title="Current Game Year">
                    <CalendarDays size={14} className="inline-block mr-1" /> GAME YEAR: {gameDate.year}
                </div>
                )}
                <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Profile Picture Thumbnail */}
                {currentUser.profile_picture_url ? (
                    <img src={currentUser.profile_picture_url} alt="PFP" className="h-6 w-6 rounded-full object-cover"/>
                ) : (
                    <UserIcon className="h-6 w-6 text-gray-400 p-0.5 border border-gray-500 rounded-full"/>
                )}
                <div className="text-xs text-gray-300 whitespace-nowrap" title="Approval Rating"><TrendingUp className="inline-block text-green-400" size={14}/> {currentUser.approval_rating}%</div>
                <div className="text-xs text-gray-300 whitespace-nowrap" title="Campaign Funds"><DollarSign className="inline-block text-yellow-400"  size={14}/> ${currentUser.campaign_funds?.toLocaleString()}</div>
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
