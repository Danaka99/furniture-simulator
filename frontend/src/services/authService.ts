import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface SignupCredentials extends LoginCredentials {
    email: string;
}

// Create axios instance with custom config
const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to all requests if it exists
authAxios.interceptors.request.use(
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

export const authService = {
    async login(credentials: LoginCredentials) {
        try {
            const response = await authAxios.post('/auth/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },

    async signup(credentials: SignupCredentials) {
        try {
            const response = await authAxios.post('/auth/register', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error: any) {
            console.error('Signup error:', error.response?.data || error.message);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    getSessionId() {
        return localStorage.getItem('sessionId');
    },

    async checkSession() {
        try {
            const sessionId = this.getSessionId();
            if (!sessionId) return false;

            const response = await authAxios.get('/auth/check', {
                headers: {
                    'X-Session-ID': sessionId
                }
            });
            return response.data.authenticated;
        } catch (error) {
            return false;
        }
    }
}; 