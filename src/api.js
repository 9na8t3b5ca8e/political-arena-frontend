// frontend/src/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

/**
 * Make an API call with authentication and standard error handling
 * @param {string} endpoint - The API endpoint to call (without the base URL)
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} The response data
 * @throws {Error} If the API call fails
 */
export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    };

    const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {}),
        },
    };

    // Ensure the endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    try {
        const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, fetchOptions);
        
        // Parse the JSON response
        const data = await response.json();
        
        // Check if the response was successful
        if (!response.ok) {
            throw new Error(data.error || data.message || 'API call failed');
        }
        
        return data;
    } catch (error) {
        // Log the error for debugging
        console.error('API call failed:', error);
        
        // Re-throw the error to be handled by the component
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