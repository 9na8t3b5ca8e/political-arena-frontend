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

// --- Campaign Finance API Calls ---

/**
 * Submits a contribution to a candidate.
 * @param {object} contributionData - The contribution details.
 * @param {number} contributionData.candidateId - The ID of the election_candidate.
 * @param {number} contributionData.amount - The donation amount.
 * @param {string} contributionData.source - 'individual' or 'pac'.
 * @returns {Promise<object>} The API response.
 */
export const donateToCandidate = async (contributionData) => {
  return await apiCall('/finance/contribute', {
    method: 'POST',
    body: JSON.stringify(contributionData),
  });
};

/**
 * Records an expenditure for a candidate.
 * @param {object} expenditureData - The expenditure details.
 * @param {number} expenditureData.candidateId - The ID of the election_candidate.
 * @param {number} expenditureData.amount - The amount spent.
 * @param {string} expenditureData.purpose - The purpose of the spending.
 * @returns {Promise<object>} The API response.
 */
export const spendCampaignFunds = async (expenditureData) => {
  return await apiCall('/finance/spend', {
    method: 'POST',
    body: JSON.stringify(expenditureData),
  });
};

/**
 * Retrieves the financial ledger for a candidate.
 * @param {number} candidateId - The ID of the election_candidate.
 * @returns {Promise<object>} An object with contributions and expenditures arrays.
 */
export const getFinanceLedger = async (candidateId) => {
  return await apiCall(`/finance/ledger/${candidateId}`);
};