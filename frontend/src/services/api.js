import axios from 'axios';

/**
 * Pre-configured Axios instance for full-stack API requests
 */
const rawApiUrl = (
  import.meta.env?.VITE_BACKEND_API_URL ||
  import.meta.env?.BACKEND_API_URL ||
  import.meta.env?.VITE_API_URL ||
  ''
).trim();

let baseURL = '/api';
if (rawApiUrl) {
  let cleaned = rawApiUrl;
  while (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
  if (cleaned.endsWith('/api')) {
    baseURL = cleaned;
  } else {
    baseURL = `${cleaned}/api`;
  }
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach bearer token and admin key if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('vt_auth_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('godrive_admin_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const adminKey =
        localStorage.getItem('vt_admin_key') ||
        localStorage.getItem('admin_key') ||
        localStorage.getItem('godrive_admin_key') ||
        import.meta.env?.VITE_ADMIN_KEY ||
        import.meta.env?.VITE_ADMIN_API_KEY;
      if (adminKey && !config.headers['x-admin-key']) {
        config.headers['x-admin-key'] = adminKey;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error formatting and auto-refresh expired JWTs
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('vt_refresh_token') || localStorage.getItem('refreshToken')
          : null;
      if (refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          const newToken = res.data?.data?.token;
          if (newToken) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('vt_auth_token', newToken);
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('token');
          localStorage.removeItem('vt_auth_token');
          localStorage.removeItem('vt_refresh_token');
          localStorage.removeItem('refreshToken');
        } finally {
          isRefreshing = false;
        }
      }
    }

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
