// frontend/src/utils/dateUtils.js

/**
 * Get the user's saved timezone preference from localStorage
 * @returns {string} The timezone identifier or undefined for auto-detect
 */
export const getUserTimezone = () => {
    const savedTimezone = localStorage.getItem('userTimezone');
    return savedTimezone === 'Auto-detect' ? undefined : savedTimezone;
};

/**
 * Format a date according to the user's timezone preference
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatUserDate = (date, options = {}) => {
    const userTimezone = getUserTimezone();
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };

    if (userTimezone) {
        defaultOptions.timeZone = userTimezone;
    }

    return dateObj.toLocaleString(undefined, defaultOptions);
};

/**
 * Format a date for display in a short format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "Dec 25, 2024 3:30 PM")
 */
export const formatShortDate = (date) => {
    return formatUserDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Format a date for display in a long format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "December 25, 2024 at 3:30:45 PM EST")
 */
export const formatLongDate = (date) => {
    return formatUserDate(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    });
};

/**
 * Format just the time portion
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted time string (e.g., "3:30 PM")
 */
export const formatTime = (date) => {
    return formatUserDate(date, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Format just the date portion
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "December 25, 2024")
 */
export const formatDateOnly = (date) => {
    return formatUserDate(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}; 