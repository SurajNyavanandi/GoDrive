import axios from 'axios';

/**
 * Pre-configured Axios instance for full-stack API requests
 */
const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const isLegacyUrl = rawApiUrl.includes('onrender.com') || rawApiUrl.includes('godrive');
const baseURL = isLegacyUrl || !rawApiUrl || rawApiUrl === '/api'
  ? '/api'
  : (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`);

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach bearer token if present
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vt_auth_token') || localStorage.getItem('token')
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    const enhancedError = new Error(message);
    enhancedError.response = error.response;
    enhancedError.statusCode = error.response?.status;
    return Promise.reject(enhancedError);
  }
);

export default api;
