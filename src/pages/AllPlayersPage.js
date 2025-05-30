import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api';
import { formatPercentage } from '../utils/formatters';
import { 
    Users, Search, Filter, ChevronLeft, ChevronRight, 
    UserCircle2, TrendingUp, DollarSign, MapPin, 
    Building2, BarChart3, ArrowUpDown, ArrowUp, ArrowDown 
} from 'lucide-react';
import PositionBadge from '../components/PositionBadge';
import { allStates } from '../state-data';

const AllPlayersPage = ({ currentUser }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({});
    const [stats, setStats] = useState({});
    
    // Filters and Sorting
    const [filters, setFilters] = useState({
        search: '',
        party: 'all',
        state: 'all',
        office: 'all',
        page: 1,
        sortBy: 'default',
        sortOrder: 'asc'
    });

    const parties = ['Democrat', 'Republican', 'Independent'];
    const officeOptions = [
        { value: 'all', label: 'All Offices' },
        { value: 'citizen', label: 'Citizens Only' },
        { value: 'officeholder', label: 'Office Holders Only' }
    ];

    const sortOptions = [
        { value: 'default', label: 'Default (Office > Approval)' },
        { value: 'name', label: 'Name' },
        { value: 'approval', label: 'Approval Rating' },
        { value: 'funds', label: 'Campaign Funds' },
        { value: 'capital', label: 'Political Capital' },
        { value: 'office', label: 'Current Office' },
        { value: 'party', label: 'Political Party' },
        { value: 'state', label: 'Home State' },
        { value: 'joined', label: 'Date Joined' }
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
            page: 1 // Reset to page 1 when filtering/sorting
        }));
    };

    const handleSortChange = (newSortBy) => {
        setFilters(prev => {
            let newSortOrder = 'asc';
            
            // If clicking the same sort field, toggle direction
            if (prev.sortBy === newSortBy) {
                newSortOrder = prev.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                // For certain fields, default to descending
                if (['approval', 'funds', 'capital', 'joined'].includes(newSortBy)) {
                    newSortOrder = 'desc';
                }
            }
            
            return {
                ...prev,
                sortBy: newSortBy,
                sortOrder: newSortOrder,
                page: 1
            };
        });
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

    const getSortIcon = (sortField) => {
        if (filters.sortBy !== sortField) {
            return <ArrowUpDown size={14} className="text-gray-500" />;
        }
        return filters.sortOrder === 'asc' ? 
            <ArrowUp size={14} className="text-blue-400" /> : 
            <ArrowDown size={14} className="text-blue-400" />;
    };

    const getCurrentSortLabel = () => {
        const sortOption = sortOptions.find(opt => opt.value === filters.sortBy);
        return sortOption ? sortOption.label : 'Default';
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

                    {/* Filters and Sorting */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                        <div className="flex items-center mb-4">
                            <Filter className="mr-2" size={20} />
                            <h3 className="text-lg font-semibold text-blue-200">Filters & Sorting</h3>
                        </div>
                        
                        {/* First Row: Search and Sort */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search players..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Second Row: Filter Options */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Political Party</label>
                                <select
                                    value={filters.party}
                                    onChange={(e) => handleFilterChange('party', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="all">All Parties</option>
                                    {parties.map(party => (
                                        <option key={party} value={party}>{party}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Home State</label>
                                <select
                                    value={filters.state}
                                    onChange={(e) => handleFilterChange('state', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="all">All States</option>
                                    {allStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Current Office</label>
                                <select
                                    value={filters.office}
                                    onChange={(e) => handleFilterChange('office', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    {officeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Current Sort Display */}
                        <div className="mt-4 text-sm text-gray-400">
                            Currently sorted by: <span className="text-blue-300 font-medium">{getCurrentSortLabel()}</span> 
                            ({filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'})
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
                            {/* Header */}
                            <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-blue-200">
                                        {pagination.totalPlayers ? `${pagination.totalPlayers} Players Found` : 'Loading...'}
                                    </h2>
                                    
                                    {/* Quick Sort Buttons */}
                                    <div className="hidden md:flex items-center space-x-2">
                                        <span className="text-sm text-gray-400">Quick sort:</span>
                                        <button
                                            onClick={() => handleSortChange('approval')}
                                            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                                                filters.sortBy === 'approval' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                            }`}
                                        >
                                            <TrendingUp size={14} />
                                            <span>Approval</span>
                                            {filters.sortBy === 'approval' && getSortIcon('approval')}
                                        </button>
                                        <button
                                            onClick={() => handleSortChange('funds')}
                                            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                                                filters.sortBy === 'funds' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                            }`}
                                        >
                                            <DollarSign size={14} />
                                            <span>Funds</span>
                                            {filters.sortBy === 'funds' && getSortIcon('funds')}
                                        </button>
                                        <button
                                            onClick={() => handleSortChange('name')}
                                            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                                                filters.sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                            }`}
                                        >
                                            <UserCircle2 size={14} />
                                            <span>Name</span>
                                            {filters.sortBy === 'name' && getSortIcon('name')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="text-gray-400">Loading players...</div>
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center">
                                    <div className="text-red-400">{error}</div>
                                </div>
                            ) : players.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-gray-400">No players found matching your criteria.</div>
                                </div>
                            ) : (
                                <>
                                    {/* Table Header - Desktop */}
                                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-700 border-b border-gray-600 text-sm font-medium text-gray-300">
                                        <button 
                                            onClick={() => handleSortChange('name')}
                                            className="col-span-3 flex items-center space-x-1 hover:text-blue-300 transition-colors text-left"
                                        >
                                            <span>Player</span>
                                            {getSortIcon('name')}
                                        </button>
                                        <button 
                                            onClick={() => handleSortChange('party')}
                                            className="col-span-2 flex items-center space-x-1 hover:text-blue-300 transition-colors text-left"
                                        >
                                            <span>Party</span>
                                            {getSortIcon('party')}
                                        </button>
                                        <button 
                                            onClick={() => handleSortChange('office')}
                                            className="col-span-2 flex items-center space-x-1 hover:text-blue-300 transition-colors text-left"
                                        >
                                            <span>Office</span>
                                            {getSortIcon('office')}
                                        </button>
                                        <button 
                                            onClick={() => handleSortChange('state')}
                                            className="col-span-1 flex items-center space-x-1 hover:text-blue-300 transition-colors text-left"
                                        >
                                            <span>State</span>
                                            {getSortIcon('state')}
                                        </button>
                                        <button 
                                            onClick={() => handleSortChange('approval')}
                                            className="col-span-1 flex items-center space-x-1 hover:text-blue-300 transition-colors text-left"
                                        >
                                            <span>Approval</span>
                                            {getSortIcon('approval')}
                                        </button>
                                        <button 
                                            onClick={() => handleSortChange('funds')}
                                            className="col-span-2 flex items-center space-x-1 hover:text-blue-300 transition-colors text-left"
                                        >
                                            <span>Campaign Funds</span>
                                            {getSortIcon('funds')}
                                        </button>
                                        <button 
                                            onClick={() => handleSortChange('capital')}
                                            className="col-span-1 flex items-center space-x-1 hover:text-blue-300 transition-colors text-left"
                                        >
                                            <span>PC</span>
                                            {getSortIcon('capital')}
                                        </button>
                                    </div>

                                    {/* Players List */}
                                    <div className="divide-y divide-gray-700">
                                        {players.map((player) => (
                                            <div key={player.user_id} className="p-6 hover:bg-gray-700 transition-colors">
                                                {/* Desktop Layout */}
                                                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                                                    {/* Player Info */}
                                                    <div className="col-span-3 flex items-center space-x-3">
                                                        {player.profile_picture_url ? (
                                                            <img 
                                                                src={player.profile_picture_url} 
                                                                alt={`${player.first_name} ${player.last_name}`}
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-600"
                                                            />
                                                        ) : (
                                                            <UserCircle2 className="w-10 h-10 text-gray-400" />
                                                        )}
                                                        <div>
                                                            <Link 
                                                                to={`/profile/${player.user_id}`}
                                                                className="text-lg font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                                                            >
                                                                {player.first_name} {player.last_name}
                                                            </Link>
                                                            <div className="text-sm text-gray-400">@{player.username}</div>
                                                        </div>
                                                    </div>

                                                    {/* Party */}
                                                    <div className="col-span-2">
                                                        <span className={`font-medium ${getPartyColor(player.party)}`}>
                                                            {player.party}
                                                        </span>
                                                    </div>

                                                    {/* Office & Leadership */}
                                                    <div className="col-span-2 flex items-center space-x-2">
                                                        <span className="text-sm text-gray-300">{player.current_office}</span>
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

                                                    {/* State */}
                                                    <div className="col-span-1">
                                                        <span className="text-sm text-gray-300">{player.home_state}</span>
                                                    </div>

                                                    {/* Approval */}
                                                    <div className="col-span-1">
                                                        <div className="flex items-center space-x-1">
                                                            <TrendingUp size={14} className="text-green-400" />
                                                            <span className="text-sm font-medium">{player.approval_rating}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Campaign Funds */}
                                                    <div className="col-span-2">
                                                        <div className="flex items-center space-x-1">
                                                            <DollarSign size={14} className="text-yellow-400" />
                                                            <span className="text-sm font-medium">
                                                                ${player.campaign_funds?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Political Capital */}
                                                    <div className="col-span-1">
                                                        <div className="flex items-center space-x-1">
                                                            <Building2 size={14} className="text-purple-400" />
                                                            <span className="text-sm font-medium">{player.political_capital}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Mobile Layout */}
                                                <div className="lg:hidden">
                                                    <div className="flex items-start space-x-3 mb-3">
                                                        {player.profile_picture_url ? (
                                                            <img 
                                                                src={player.profile_picture_url} 
                                                                alt={`${player.first_name} ${player.last_name}`}
                                                                className="w-12 h-12 rounded-full object-cover border border-gray-600"
                                                            />
                                                        ) : (
                                                            <UserCircle2 className="w-12 h-12 text-gray-400" />
                                                        )}
                                                        
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
                                                                <div className="flex items-center space-x-1">
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
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                                <div className="flex items-center space-x-1">
                                                                    <MapPin size={14} className="text-blue-400" />
                                                                    <span className="text-gray-300">{player.home_state}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <Building2 size={14} className="text-orange-400" />
                                                                    <span className="text-gray-300">{player.current_office}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <TrendingUp size={14} className="text-green-400" />
                                                                    <span className="font-medium">{player.approval_rating}%</span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <DollarSign size={14} className="text-yellow-400" />
                                                                    <span className="font-medium">${player.campaign_funds?.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
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