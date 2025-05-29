import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';

const CampaignHQ = () => {
    const { user } = useAuth();
    const [availableStaff, setAvailableStaff] = useState([]);
    const [hiredStaff, setHiredStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [availableRes, hiredRes] = await Promise.all([
                    axios.get('/api/staff/available'),
                    axios.get('/api/staff/hired')
                ]);
                setAvailableStaff(availableRes.data);
                setHiredStaff(hiredRes.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load campaign staff data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleHire = async (staffTypeId) => {
        try {
            await axios.post('/api/staff/hire', { staffTypeId });
            // Refresh hired staff list
            const hiredRes = await axios.get('/api/staff/hired');
            setHiredStaff(hiredRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to hire staff member');
        }
    };

    const handleFire = async (hiredStaffId) => {
        try {
            await axios.post('/api/staff/fire', { hiredStaffId });
            // Refresh hired staff list
            const hiredRes = await axios.get('/api/staff/hired');
            setHiredStaff(hiredRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fire staff member');
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Campaign Headquarters</h2>
            
            {/* Current Staff Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Current Campaign Staff</h3>
                {hiredStaff.length === 0 ? (
                    <p className="text-gray-500">No staff members currently hired.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {hiredStaff.map((staff) => (
                            <div key={staff.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{staff.npc_name}</h4>
                                        <p className="text-sm text-gray-600">{staff.role_name}</p>
                                    </div>
                                    <button
                                        onClick={() => handleFire(staff.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Fire
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Salary: {formatCurrency(staff.salary_per_game_day)}/day
                                </p>
                                <p className="text-sm mt-1">
                                    Effect: {staff.effect_value > 0 ? '+' : ''}{staff.effect_value * 100}% {staff.effect_type.replace('_', ' ')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Staff Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Available Positions</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableStaff.map((staff) => (
                        <div key={staff.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold">{staff.role_name}</h4>
                                    <p className="text-sm text-gray-600">{staff.description}</p>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                    Hiring Cost: {formatCurrency(staff.hiring_cost)}
                                </p>
                                <p className="text-sm">
                                    Salary: {formatCurrency(staff.salary_per_game_day)}/day
                                </p>
                                <p className="text-sm">
                                    Effect: {staff.effect_value > 0 ? '+' : ''}{staff.effect_value * 100}% {staff.effect_type.replace('_', ' ')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleHire(staff.id)}
                                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                            >
                                Hire
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CampaignHQ; 