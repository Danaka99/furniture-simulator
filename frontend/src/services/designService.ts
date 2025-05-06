import axios, { AxiosError } from 'axios';
import { Design } from '../types/design';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api';

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface DesignResponse {
    design: Design;
    message: string;
}

interface DesignsResponse {
    designs: Design[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Create a new axios instance for design operations
const designAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to all requests
designAxios.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (!token) {
            window.location.href = '/login';
            return Promise.reject(new Error('No authentication token'));
        }
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
designAxios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const designService = {
    async saveDesign(design: Design): Promise<Design> {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const response = await designAxios.post<DesignResponse>('/designs', design);
            console.log('Design saved:', response.data);
            return response.data.design;
        } catch (error) {
            console.error('Failed to save design:', error);
            throw error;
        }
    },

    async updateDesign(design: Design): Promise<Design> {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const response = await designAxios.put<DesignResponse>(`/designs/${design.id}`, design);
            console.log('Design updated:', response.data);
            return response.data.design;
        } catch (error) {
            console.error('Failed to update design:', error);
            throw error;
        }
    },

    async getDesign(designId: string): Promise<Design> {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const response = await designAxios.get<DesignResponse>(`/designs/${designId}`);
            return response.data.design;
        } catch (error) {
            console.error('Failed to fetch design:', error);
            throw error;
        }
    },

    async getAllDesigns(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Design>> {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            console.log('Fetching designs with params:', { page, limit });
            const response = await designAxios.get<DesignsResponse>('/designs', {
                params: {
                    page,
                    limit
                }
            });
            console.log('Received designs response:', response.data);

            // Transform the response to match PaginatedResponse interface
            const paginatedResponse: PaginatedResponse<Design> = {
                data: response.data.designs || [],
                total: response.data.total || 0,
                page: response.data.page || page,
                limit: response.data.limit || limit,
                totalPages: response.data.totalPages || 1
            };

            console.log('Transformed response:', paginatedResponse);
            return paginatedResponse;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Failed to fetch designs:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            } else {
                console.error('Failed to fetch designs:', error);
            }
            // Return empty response instead of throwing
            return {
                data: [],
                total: 0,
                page: page,
                limit: limit,
                totalPages: 1
            };
        }
    },

    async deleteDesign(designId: string): Promise<void> {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            await designAxios.delete(`/designs/${designId}`);
            console.log('Design deleted:', designId);
        } catch (error) {
            console.error('Failed to delete design:', error);
            throw error;
        }
    }
}; 