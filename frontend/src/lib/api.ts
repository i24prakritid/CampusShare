import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    programme: string;
    password: string;
    recaptchaToken?: string;
  }) => api.post('/auth/signup', data),
  
  login: (data: { email: string; password: string; recaptchaToken?: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
};

// Group Orders API
export const groupOrdersAPI = {
  getAll: (params?: { platform?: string; hotspot?: string }) =>
    api.get('/group-orders', { params }),
  
  getMine: () => api.get('/group-orders/my'),
  
  create: (data: {
    platform: string;
    restaurantName?: string;
    balanceNeeded: number;
    hotspot: string;
    timer: number;
  }) => api.post('/group-orders', data),
  
  delete: (id: string) => api.delete(`/group-orders/${id}`),
};

// Marketplace API
export const marketplaceAPI = {
  getAll: (params?: { category?: string; minPrice?: number; maxPrice?: number; search?: string }) =>
    api.get('/marketplace', { params }),
  
  getMine: () => api.get('/marketplace/my'),
  
  create: (formData: FormData) =>
    api.post('/marketplace', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  delete: (id: string) => api.delete(`/marketplace/${id}`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  
  updateProfile: (data: {
    name?: string;
    phone?: string;
    programme?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => api.put('/users/me', data),
};

export default api;
