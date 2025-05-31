/**
 * Format a number as currency (USD)
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Format a number as a percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} The formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
    // Handles null, undefined, empty string, or non-numeric string by converting to NaN
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue)) return '0%';
    
    return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Format a number with commas for thousands
 * @param {number} number - The number to format
 * @returns {string} The formatted number string
 */
export const formatNumber = (number) => {
    if (number === null || number === undefined) return '0';
    
    return new Intl.NumberFormat('en-US').format(number);
}; 