import api from './api';

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    googleLogin: async (googleData) => {
        const response = await api.post('/auth/google', googleData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    uploadPhoto: async (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        const response = await api.post('/users/profile/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await api.put('/users/settings', settings);
        return response.data;
    }
};

export const foodService = {
    getFoods: async (params) => {
        const response = await api.get('/foods', { params });
        return response.data;
    },

    searchFoods: async (query) => {
        const response = await api.get('/foods/search', { params: { q: query } });
        return response.data;
    },

    addFood: async (foodData) => {
        const response = await api.post('/foods', foodData);
        return response.data;
    },

    analyzeImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/foods/analyze-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export const dietService = {
    getEntries: async (params) => {
        const response = await api.get('/diet/entries', { params });
        return response.data;
    },

    addEntry: async (entryData) => {
        const response = await api.post('/diet/entries', entryData);
        return response.data;
    },

    updateEntry: async (id, entryData) => {
        const response = await api.put(`/diet/entries/${id}`, entryData);
        return response.data;
    },

    deleteEntry: async (id) => {
        const response = await api.delete(`/diet/entries/${id}`);
        return response.data;
    },

    toggleCompletion: async (id) => {
        const response = await api.patch(`/diet/entries/${id}/toggle`);
        return response.data;
    }
};

export const habitService = {
    getHabits: async () => {
        const response = await api.get('/habits');
        return response.data;
    },

    createHabit: async (habitData) => {
        const response = await api.post('/habits', habitData);
        return response.data;
    },

    updateHabit: async (id, habitData) => {
        const response = await api.put(`/habits/${id}`, habitData);
        return response.data;
    },

    deleteHabit: async (id) => {
        const response = await api.delete(`/habits/${id}`);
        return response.data;
    },

    getEntries: async (id, params) => {
        const response = await api.get(`/habits/${id}/entries`, { params });
        return response.data;
    },

    toggleCompletion: async (id, date) => {
        const response = await api.patch(`/habits/${id}/entries/${date}/toggle`);
        return response.data;
    },

    getStreak: async (id) => {
        const response = await api.get(`/habits/${id}/streak`);
        return response.data;
    }
};

export const analyticsService = {
    getDailySummary: async (date) => {
        const response = await api.get('/analytics/daily', { params: { date } });
        return response.data;
    },

    getWeeklySummary: async () => {
        const response = await api.get('/analytics/weekly');
        return response.data;
    },

    getMonthlySummary: async () => {
        const response = await api.get('/analytics/monthly');
        return response.data;
    },

    getMacroBreakdown: async (date) => {
        const response = await api.get('/analytics/macros', { params: { date } });
        return response.data;
    },

    exportPDF: async () => {
        const response = await api.get('/analytics/export-pdf', {
            responseType: 'blob'
        });
        return response.data;
    }
};

export const waterService = {
    logWater: async (data) => {
        const response = await api.post('/water', data);
        return response.data;
    },

    getTodayWater: async () => {
        const response = await api.get('/water/today');
        return response.data;
    },

    getHistory: async (params) => {
        const response = await api.get('/water/history', { params });
        return response.data;
    },

    updateWater: async (id, data) => {
        const response = await api.put(`/water/${id}`, data);
        return response.data;
    }
};
