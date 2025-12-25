import axios from 'axios';

const normalizeApiBaseUrl = (rawBaseUrl) => {
    const value = (rawBaseUrl || '').trim();

    // Local dev: proxy `/api` to backend via Vite.
    if (!value) {
        return '/api';
    }

    // Support either:
    // - https://example.onrender.com
    // - https://example.onrender.com/api
    const withoutTrailingSlash = value.endsWith('/') ? value.slice(0, -1) : value;
    return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

const api = axios.create({
    // Uses VITE_API_BASE_URL for production (Vercel -> Render).
    // Falls back to `/api` for local dev (Vite proxy).
    baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;
