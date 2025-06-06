import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '../api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Enhanced user update function
    const updateUser = (updates) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            if (process.env.NODE_ENV === 'development') {
                console.log('AuthContext: User updated', { 
                    before: prev.campaign_funds, 
                    after: updated.campaign_funds,
                    hourlyIncome: updated.hourly_income 
                });
            }
            return updated;
        });
    };

    // Force refresh user data from server
    const refreshUser = async () => {
        try {
            const userData = await apiCall('/auth/profile');
            setUser(userData);
            if (process.env.NODE_ENV === 'development') {
                console.log('AuthContext: User refreshed from server', userData);
            }
            return userData;
        } catch (error) {
            console.error('AuthContext: Failed to refresh user:', error);
            return null;
        }
    };

    const loginUser = async (token) => {
        localStorage.setItem('authToken', token);
        try {
            const userData = await apiCall('/auth/profile'); // Fetch profile after setting token
            setUser(userData);
            return userData; // Return user data so AuthScreen can proceed
        } catch (error) {
            console.error('AuthContext: Login failed to fetch profile:', error);
            localStorage.removeItem('authToken'); // Clean up token if profile fetch fails
            setUser(null);
            throw error; // Re-throw for AuthScreen to handle UI
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const userData = await apiCall('/auth/profile');
                    setUser(userData);
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    localStorage.removeItem('authToken');
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            updateUser, 
            refreshUser, 
            loading, 
            loginUser,
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 