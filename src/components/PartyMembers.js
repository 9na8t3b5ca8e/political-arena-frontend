import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api';
import { formatPercentage } from '../utils/formatters';
import { Crown, Shield, DollarSign, Users, UserCircle2, TrendingUp } from 'lucide-react';
import PositionBadge from './PositionBadge';

const PartyMembers = ({ partyId }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalMembers, setTotalMembers] = useState(0);
    const [partyName, setPartyName] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const data = await apiCall(`/party/${partyId}/members`);
                setMembers(data.members);
                setTotalMembers(data.totalMembers);
                setPartyName(data.party);
            } catch (err) {
                setError('Failed to load party members');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (partyId) {
            fetchMembers();
        }
    }, [partyId]);

    if (loading) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    Party Members
                </h3>
                <div className="text-gray-400">Loading members...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    Party Members
                </h3>
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center">
                <Users className="mr-2" size={20} />
                Party Members ({totalMembers})
            </h3>
            
            {members.length === 0 ? (
                <div className="text-gray-400">No members found for this party.</div>
            ) : (
                <div className="space-y-4">
                    {members.map((member) => (
                        <div key={member.user_id} className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                            <div className="flex items-center space-x-4">
                                {/* Profile Picture */}
                                <div className="flex-shrink-0">
                                    {member.profile_picture_url ? (
                                        <img 
                                            src={member.profile_picture_url} 
                                            alt={`${member.first_name} ${member.last_name}`}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                                        />
                                    ) : (
                                        <UserCircle2 className="w-16 h-16 text-gray-500" />
                                    )}
                                </div>

                                {/* Member Info */}
                                <div className="flex-grow">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Link 
                                            to={`/profile/${member.user_id}`}
                                            className="text-lg font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                                        >
                                            {member.first_name} {member.last_name}
                                        </Link>
                                        <span className="text-sm text-gray-400">(@{member.username})</span>
                                        
                                        {/* Position Badges */}
                                        <div className="flex space-x-2">
                                            {member.party_leadership_role && (
                                                <PositionBadge 
                                                    position={member.party_leadership_role} 
                                                    party={partyName}
                                                />
                                            )}
                                            {member.current_office && member.current_office !== 'Citizen' && (
                                                <PositionBadge office={member.current_office} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Office:</span>
                                            <span className="ml-2 text-gray-200">{member.current_office || 'Citizen'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">State:</span>
                                            <span className="ml-2 text-gray-200">{member.home_state}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <TrendingUp size={14} className="text-green-400 mr-1" />
                                            <span className="text-gray-400">Approval:</span>
                                            <span className="ml-2 text-green-400">{member.approval_rating}%</span>
                                        </div>
                                        <div className="flex items-center">
                                            <DollarSign size={14} className="text-yellow-400 mr-1" />
                                            <span className="text-gray-400">PC:</span>
                                            <span className="ml-2 text-yellow-400">{member.political_capital}</span>
                                        </div>
                                    </div>

                                    {/* Additional Stats Row */}
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                        <div>
                                            <span className="text-gray-400">Name Recognition:</span>
                                            <span className="ml-2 text-purple-400">{formatPercentage(member.state_name_recognition)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Campaign Strength:</span>
                                            <span className="ml-2 text-blue-400">{formatPercentage(member.campaign_strength)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartyMembers; 