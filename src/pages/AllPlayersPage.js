import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api';
import { formatPercentage } from '../utils/formatters';
import { 
    Users, Search, Filter, ChevronLeft, ChevronRight, 
    UserCircle2, TrendingUp, DollarSign, MapPin, 
    Building2, BarChart3 
} from 'lucide-react';
import PositionBadge from '../components/PositionBadge';
import { allStates } from '../state-data';

const AllPlayersPage = ({ currentUser }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({});
    const [stats, setStats] = useState({});
    
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        party: 'all',
        state: 'all',
        office: 'all',
        page: 1
    });

    const parties = ['Democrat', 'Republican', 'Independent'];
    const officeOptions = [
        { value: 'all', label: 'All Offices' },
        { value: 'citizen', label: 'Citizens Only' },
        { value: 'officeholder', label: 'Office Holders Only' }
    ];

    useEffect(() => {
        fetchPlayers();
    }, [filters]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all' && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const data = await apiCall(`/players?${queryParams.toString()}`);
            setPlayers(data.players);
            setPagination(data.pagination);
        } catch (err) {
            setError('Failed to load players');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await apiCall('/players/stats');
            setStats(data);
        } catch (err) {
            console.error('Failed to load player stats:', err);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to page 1 when filtering
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const getPartyColor = (party) => {
        switch (party) {
            case 'Democrat': return 'text-blue-400';
            case 'Republican': return 'text-red-400';
            case 'Independent': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-blue-200 mb-4 flex items-center">
                        <Users className="mr-3" size={36} />
                        All Registered Players
                    </h1>
                    
                    {/* Stats Summary */}
                    {stats.total_players && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="text-2xl font-bold text-blue-300">{stats.total_players}</div>
                                <div className="text-sm text-gray-400">Total Players</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="text-2xl font-bold text-blue-400">{stats.democrats}</div>
                                <div className="text-sm text-gray-400">Democrats</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="text-2xl font-bold text-red-400">{stats.republicans}</div>
                                <div className="text-sm text-gray-400">Republicans</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="text-2xl font-bold text-purple-400">{stats.independents}</div>
                                <div className="text-sm text-gray-400">Independents</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                        <Filter className="mr-2" size={18} />
                        Filters
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Search Players
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Name or username..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Party Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Political Party
                            </label>
                            <select
                                value={filters.party}
                                onChange={(e) => handleFilterChange('party', e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Parties</option>
                                {parties.map(party => (
                                    <option key={party} value={party}>{party}</option>
                                ))}
                            </select>
                        </div>

                        {/* State Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Home State
                            </label>
                            <select
                                value={filters.state}
                                onChange={(e) => handleFilterChange('state', e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All States</option>
                                {allStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* Office Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Current Office
                            </label>
                            <select
                                value={filters.office}
                                onChange={(e) => handleFilterChange('office', e.target.value)}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {officeOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400">Loading players...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Players List */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-200">
                                    {pagination.totalPlayers} Players Found
                                    {pagination.totalPages > 1 && (
                                        <span className="text-sm text-gray-400 ml-2">
                                            (Page {pagination.currentPage} of {pagination.totalPages})
                                        </span>
                                    )}
                                </h3>
                            </div>

                            {players.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    No players found matching your criteria.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-700">
                                    {players.map((player) => (
                                        <div key={player.user_id} className="p-6 hover:bg-gray-700 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                {/* Profile Picture */}
                                                <div className="flex-shrink-0">
                                                    {player.profile_picture_url ? (
                                                        <img 
                                                            src={player.profile_picture_url} 
                                                            alt={`${player.first_name} ${player.last_name}`}
                                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                                                        />
                                                    ) : (
                                                        <UserCircle2 className="w-16 h-16 text-gray-500" />
                                                    )}
                                                </div>

                                                {/* Player Info */}
                                                <div className="flex-grow">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <Link 
                                                            to={`/profile/${player.user_id}`}
                                                            className="text-xl font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                                                        >
                                                            {player.first_name} {player.last_name}
                                                        </Link>
                                                        <span className="text-sm text-gray-400">(@{player.username})</span>
                                                        <span className={`text-sm font-medium ${getPartyColor(player.party)}`}>
                                                            {player.party}
                                                        </span>
                                                        
                                                        {/* Position Badges */}
                                                        <div className="flex space-x-2">
                                                            {player.party_leadership_role && (
                                                                <PositionBadge 
                                                                    position={player.party_leadership_role} 
                                                                    party={player.party}
                                                                />
                                                            )}
                                                            {player.current_office && player.current_office !== 'Citizen' && (
                                                                <PositionBadge office={player.current_office} />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                                                        <div className="flex items-center">
                                                            <Building2 size={14} className="text-gray-400 mr-1" />
                                                            <span className="text-gray-400">Office:</span>
                                                            <span className="ml-2 text-gray-200">{player.current_office || 'Citizen'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin size={14} className="text-gray-400 mr-1" />
                                                            <span className="text-gray-400">State:</span>
                                                            <span className="ml-2 text-gray-200">{player.home_state}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <TrendingUp size={14} className="text-green-400 mr-1" />
                                                            <span className="text-gray-400">Approval:</span>
                                                            <span className="ml-2 text-green-400">{player.approval_rating}%</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <DollarSign size={14} className="text-yellow-400 mr-1" />
                                                            <span className="text-gray-400">PC:</span>
                                                            <span className="ml-2 text-yellow-400">{player.political_capital}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BarChart3 size={14} className="text-purple-400 mr-1" />
                                                            <span className="text-gray-400">SNR:</span>
                                                            <span className="ml-2 text-purple-400">{formatPercentage(player.state_name_recognition)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BarChart3 size={14} className="text-blue-400 mr-1" />
                                                            <span className="text-gray-400">CS:</span>
                                                            <span className="ml-2 text-blue-400">{formatPercentage(player.campaign_strength)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalPlayers)} of {pagination.totalPlayers} players
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} className="mr-1" />
                                        Previous
                                    </button>
                                    
                                    <span className="px-3 py-2 text-sm font-medium text-gray-300">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
                                    
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight size={16} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllPlayersPage; 