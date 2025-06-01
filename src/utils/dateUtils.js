// frontend/src/utils/dateUtils.js
import { useEffect, useState } from 'react';

// Global variable to track timezone preference changes
let timezoneChangeListeners = [];

/**
 * Add a listener that will be called when timezone preference changes
 * @param {Function} listener - Function to call when timezone changes
 */
export const addTimezoneChangeListener = (listener) => {
    timezoneChangeListeners.push(listener);
};

/**
 * Remove a timezone change listener
 * @param {Function} listener - Function to remove
 */
export const removeTimezoneChangeListener = (listener) => {
    timezoneChangeListeners = timezoneChangeListeners.filter(l => l !== listener);
};

/**
 * Notify all listeners that timezone preference has changed
 */
export const notifyTimezoneChange = () => {
    timezoneChangeListeners.forEach(listener => {
        try {
            listener();
        } catch (error) {
            console.error('Error in timezone change listener:', error);
        }
    });
};

/**
 * Get the user's saved timezone preference from localStorage or user context
 * @param {Object} currentUser - The current user object (optional)
 * @returns {string} The timezone identifier or undefined for auto-detect
 */
export const getUserTimezone = (currentUser = null) => {
    // First try to get from user context if provided
    if (currentUser && currentUser.timezone) {
        return currentUser.timezone === 'Auto-detect' ? undefined : currentUser.timezone;
    }
    
    // Fallback to localStorage
    const savedTimezone = localStorage.getItem('userTimezone');
    return savedTimezone === 'Auto-detect' ? undefined : savedTimezone;
};

/**
 * Format a date according to the user's timezone preference
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {Object} currentUser - The current user object (optional)
 * @returns {string} Formatted date string
 */
export const formatUserDate = (date, options = {}, currentUser = null) => {
    const userTimezone = getUserTimezone(currentUser);
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
 * @param {Object} currentUser - The current user object (optional)
 * @returns {string} Formatted date string (e.g., "Dec 25, 2024 3:30 PM")
 */
export const formatShortDate = (date, currentUser = null) => {
    return formatUserDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }, currentUser);
};

/**
 * Format a date for display in a long format
 * @param {Date|string} date - The date to format
 * @param {Object} currentUser - The current user object (optional)
 * @returns {string} Formatted date string (e.g., "December 25, 2024 at 3:30:45 PM EST")
 */
export const formatLongDate = (date, currentUser = null) => {
    return formatUserDate(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }, currentUser);
};

/**
 * Format just the time portion
 * @param {Date|string} date - The date to format
 * @param {Object} currentUser - The current user object (optional)
 * @returns {string} Formatted time string (e.g., "3:30 PM")
 */
export const formatTime = (date, currentUser = null) => {
    return formatUserDate(date, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }, currentUser);
};

/**
 * Format just the date portion
 * @param {Date|string} date - The date to format
 * @param {Object} currentUser - The current user object (optional)
 * @returns {string} Formatted date string (e.g., "December 25, 2024")
 */
export const formatDateOnly = (date, currentUser = null) => {
    return formatUserDate(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }, currentUser);
};

/**
 * Format a date with timezone-aware relative time and absolute time
 * @param {Date|string} date - The date to format
 * @param {Object} currentUser - The current user object (optional)
 * @returns {Object} Object with relative and absolute time strings
 */
export const formatRelativeTime = (date, currentUser = null) => {
    const targetDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = targetDate - now;

    let relativeString = "Closed";
    let hasPassed = true;

    if (diff > 0) {
        hasPassed = false;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        if (days > 0) relativeString = `${days}d ${hours}h ${minutes}m left`;
        else if (hours > 0) relativeString = `${hours}h ${minutes}m left`;
        else if (minutes > 0) relativeString = `${minutes}m left`;
        else relativeString = "<1m left";
    }

    const absoluteString = formatUserDate(targetDate, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short'
    }, currentUser);

    return { relative: relativeString, absolute: absoluteString, hasPassed };
};

/**
 * React hook to force component re-render when timezone changes
 * Use this in components that display dates/times to ensure they update when user changes timezone
 */
export const useTimezoneUpdates = () => {
    const [, forceUpdate] = useState({});
    
    useEffect(() => {
        const updateComponent = () => {
            forceUpdate({});
        };
        
        addTimezoneChangeListener(updateComponent);
        
        return () => {
            removeTimezoneChangeListener(updateComponent);
        };
    }, []);
}; 