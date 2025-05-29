import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api';
import { Users, ChevronsRight, BarChart2, TrendingUp } from 'lucide-react'; // Added icons

const AllPartiesPage = () => {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParties = async () => {
            try {
                const data = await apiCall('/party/all');
                setParties(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load parties data. ' + (err.message || ''));
                setLoading(false);
            }
        };
        fetchParties();
    }, []);

    if (loading) return <div className="p-6 text-center text-gray-400">Loading all parties...</div>;
    if (error) return <div className="p-6 bg-red-700/20 text-red-300 rounded-lg">{error}</div>;

    return (
        <div className="p-4 sm:p-6 bg-gray-800 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-blue-300 mb-8">All Political Parties</h1>
            {parties.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No parties found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parties.map(party => (
                        <div key={party.id} className="bg-gray-700 rounded-lg shadow-lg p-5 hover:shadow-blue-500/30 transition-shadow duration-300 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-blue-200 mb-3 truncate">{party.name}</h2>
                                <p className="text-sm text-gray-300 mb-1 flex items-center">
                                    <Users size={16} className="mr-2 text-gray-400" /> 
                                    Members: <span className="font-semibold ml-1">{party.member_count || 0}</span>
                                </p>
                                <p className="text-sm text-gray-300 mb-1 truncate">
                                    Chair: <span className="font-semibold">{party.chair_username || 'Vacant'}</span>
                                </p>
                                <div className="mt-3 pt-3 border-t border-gray-600">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-1">Ideology:</h4>
                                    <p className="text-sm text-gray-300 mb-1 flex items-center">
                                        <BarChart2 size={15} className="mr-2 text-green-400" />
                                        Economic: <span className="font-semibold ml-1">{party.economic_stance_label || 'Not Set'}</span>
                                    </p>
                                    <p className="text-sm text-gray-300 flex items-center">
                                        <TrendingUp size={15} className="mr-2 text-purple-400" />
                                        Social: <span className="font-semibold ml-1">{party.social_stance_label || 'Not Set'}</span>
                                    </p>
                                </div>
                            </div>
                            <Link 
                                to={`/party/${party.id}`} 
                                className="mt-5 block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-center transition-colors duration-200 flex items-center justify-center"
                            >
                                View Party Page <ChevronsRight size={18} className="ml-1.5" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllPartiesPage; 