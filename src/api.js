// frontend/src/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://political-arena-backend.onrender.com/api';

export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    const config = {
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        ...options
    };
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
        const errorMsg = data.errors ? data.errors[0].msg : data.error;
        throw new Error(errorMsg || 'API request failed');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
    }
};