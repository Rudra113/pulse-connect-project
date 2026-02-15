/**
 * API Service
 * Centralized API calls for the frontend
 */

import axios from 'axios';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('medtracker_token');
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
            // Token expired or invalid - clear storage and redirect to login
            localStorage.removeItem('medtracker_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

// ==================== MEDICATIONS API ====================
export const medicationsAPI = {
    getAll: async () => {
        const response = await api.get('/medications');
        return response.data;
    },

    create: async (medicationData) => {
        const response = await api.post('/medications', medicationData);
        return response.data;
    },

    update: async (id, updateData) => {
        const response = await api.put(`/medications/${id}`, updateData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/medications/${id}`);
        return response.data;
    },

    refill: async (id, totalQuantity) => {
        const response = await api.put(`/medications/${id}/refill`, { totalQuantity });
        return response.data;
    },

    takeDose: async (id) => {
        const response = await api.put(`/medications/${id}/take-dose`);
        return response.data;
    }
};

// ==================== APPOINTMENTS API ====================
export const appointmentsAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    create: async (appointmentData) => {
        const response = await api.post('/appointments', appointmentData);
        return response.data;
    },

    update: async (id, updateData) => {
        const response = await api.put(`/appointments/${id}`, updateData);
        return response.data;
    },

    cancel: async (id, reason) => {
        const response = await api.delete(`/appointments/${id}`, { data: { reason } });
        return response.data;
    }
};

// ==================== CHATS API ====================
export const chatsAPI = {
    getAll: async () => {
        const response = await api.get('/chats');
        return response.data;
    },

    create: async (userId) => {
        const response = await api.post('/chats', { userId });
        return response.data;
    },

    getMessages: async (chatId, params = {}) => {
        const response = await api.get(`/chats/${chatId}/messages`, { params });
        return response.data;
    },

    sendMessage: async (chatId, text, type = 'text') => {
        const response = await api.post(`/chats/${chatId}/messages`, { text, type });
        return response.data;
    },

    markAsRead: async (chatId) => {
        const response = await api.put(`/chats/${chatId}/read`);
        return response.data;
    }
};

// ==================== QUEUE API ====================
export const queueAPI = {
    getQueue: async () => {
        const response = await api.get('/queue');
        return response.data;
    },

    addToQueue: async (doctorId, condition, urgency) => {
        const response = await api.post('/queue', { doctorId, condition, urgency });
        return response.data;
    },

    startConsultation: async (id) => {
        const response = await api.put(`/queue/${id}/start`);
        return response.data;
    },

    completeConsultation: async (id, notes) => {
        const response = await api.put(`/queue/${id}/complete`, { notes });
        return response.data;
    },

    removeFromQueue: async (id) => {
        const response = await api.delete(`/queue/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/queue/stats');
        return response.data;
    },

    // Join queue with full consultation details
    joinQueue: async (consultationData) => {
        const response = await api.post('/queue', consultationData);
        return response.data;
    },

    // Get patient's own consultations
    getMyConsultations: async () => {
        const response = await api.get('/queue/my-consultations');
        return response.data;
    }
};

// ==================== PRESCRIPTIONS API ====================
export const prescriptionsAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/prescriptions', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/prescriptions/${id}`);
        return response.data;
    },

    create: async (prescriptionData) => {
        const response = await api.post('/prescriptions', prescriptionData);
        return response.data;
    },

    update: async (id, updateData) => {
        const response = await api.put(`/prescriptions/${id}`, updateData);
        return response.data;
    }
};

// ==================== SYMPTOMS API ====================
export const symptomsAPI = {
    analyze: async (symptoms) => {
        const response = await api.post('/symptoms/check', { symptoms });
        return response.data;
    },

    // Public analysis (no login required)
    analyzePublic: async (symptoms) => {
        const response = await api.post('/symptoms/analyze-public', { symptoms });
        return response.data;
    },

    getHistory: async (limit = 10) => {
        const response = await api.get('/symptoms/history', { params: { limit } });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/symptoms/${id}`);
        return response.data;
    },

    markScheduled: async (id, appointmentId) => {
        const response = await api.put(`/symptoms/${id}/schedule`, { appointmentId });
        return response.data;
    }
};

// ==================== USERS API ====================
export const usersAPI = {
    getDoctors: async () => {
        const response = await api.get('/users/doctors');
        return response.data;
    },

    getPatients: async () => {
        const response = await api.get('/users/patients');
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (updateData) => {
        const response = await api.put('/users/profile', updateData);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    }
};

// ==================== ADMIN API ====================
export const adminAPI = {
    // Get admin dashboard stats
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Get all pending doctor registrations
    getPendingDoctors: async () => {
        const response = await api.get('/admin/doctors/pending');
        return response.data;
    },

    // Get all doctors with status
    getAllDoctors: async () => {
        const response = await api.get('/admin/doctors/all');
        return response.data;
    },

    // Approve a doctor
    approveDoctor: async (doctorId) => {
        const response = await api.put(`/admin/doctors/${doctorId}/approve`);
        return response.data;
    },

    // Reject a doctor
    rejectDoctor: async (doctorId, reason) => {
        const response = await api.put(`/admin/doctors/${doctorId}/reject`, { reason });
        return response.data;
    },

    // Suspend a doctor
    suspendDoctor: async (doctorId, reason) => {
        const response = await api.put(`/admin/doctors/${doctorId}/suspend`, { reason });
        return response.data;
    },

    // Get all users
    getAllUsers: async (filters = {}) => {
        const response = await api.get('/admin/users', { params: filters });
        return response.data;
    }
};

export default api;
