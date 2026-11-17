/**
 * Centralized API configuration for the Student Scanner App.
 * Points to the backend server via VITE_API_URL or defaults to localhost:10000.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';
