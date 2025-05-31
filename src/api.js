// frontend/src/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

/**
 * Make an API call with authentication and standard error handling
 * @param {string} endpoint - The API endpoint to call (without the base URL)
 * @param {Object} options - Fetch options (method, body, etc.)
 * @param {boolean} isFileUpload - Whether this is a file upload (FormData)
 * @returns {Promise<any>} The response data
 * @throws {Error} If the API call fails
 */
export const apiCall = async (endpoint, options = {}, isFileUpload = false) => {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            // Don't set Content-Type for file uploads - browser will set it with boundary
            ...(isFileUpload ? {} : { 'Content-Type': 'application/json' }),
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
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // For non-JSON responses, try to get text and parse as JSON if possible
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                // If can't parse as JSON, create error object
                data = { error: text || 'Non-JSON response received' };
            }
        }
        
        // Check if the response was successful
        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        // Log the error for debugging only in development
        if (process.env.NODE_ENV === 'development') {
            console.error('API call failed:', error);
        }
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