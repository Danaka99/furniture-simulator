import axios, { AxiosError } from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api';

export interface CartItem {
    id?: string;           // Optional for new items
    furnitureId: string;   // Required when adding to cart
    type: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartData {
    items: CartItem[];
}

// Create a new axios instance for cart operations
const cartAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to all requests
cartAxios.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (!token) {
            // Redirect to login if no token
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
cartAxios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear auth data and redirect to login
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const cartService = {
    async getCart(): Promise<CartData> {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            console.log('Fetching cart...');
            const response = await cartAxios.get('/cart');
            console.log('Cart fetch response:', JSON.stringify(response.data, null, 2));

            // Ensure we have a valid cart structure
            const cartData = response.data;
            if (!cartData || !Array.isArray(cartData.items)) {
                console.error('Invalid cart data structure:', cartData);
                return { items: [] };
            }

            return cartData;
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 404) {
                    console.log('Cart not found, returning empty cart');
                    return { items: [] };
                }
                console.error('Failed to fetch cart:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            } else {
                console.error('Failed to fetch cart:', error);
            }
            throw error;
        }
    },

    async updateCart(item: CartItem) {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            // Include all required fields in the payload
            const payload = {
                furnitureId: item.furnitureId,
                type: item.type,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            };

            console.log('Cart update request payload:', JSON.stringify(payload, null, 2));
            const response = await cartAxios.post('/cart/update', payload);
            console.log('Cart update response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 400) {
                const errorData = error.response.data;
                console.error('Cart update validation error:', {
                    message: errorData.message,
                    required: JSON.stringify(errorData.required, null, 2),
                    received: JSON.stringify(errorData.received, null, 2)
                });
                throw new Error(`Invalid cart update request: ${JSON.stringify({
                    message: errorData.message,
                    required: errorData.required,
                    received: errorData.received
                }, null, 2)}`);
            } else if (error instanceof AxiosError && error.response?.status === 500) {
                console.error('Server error:', error.response.data);
            }
            console.error('Failed to update cart:', error);
            throw error;
        }
    },

    async updateQuantity(furnitureId: string, quantity: number) {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            if (quantity < 1) {
                throw new Error('Quantity must be greater than 0');
            }

            // Get current item details from cart
            const cart = await this.getCart();
            const item = cart.items.find((item) => item.furnitureId === furnitureId || item.id === furnitureId);

            if (!item) {
                throw new Error('Item not found in cart');
            }

            // Update with new quantity but keep other details
            const payload = {
                furnitureId: furnitureId, // Explicitly set the furnitureId
                type: item.type,
                name: item.name,
                price: item.price,
                quantity: quantity
            };

            console.log('Updating item quantity:', JSON.stringify(payload, null, 2));
            const response = await cartAxios.post('/cart/update', payload);
            console.log('Quantity update response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Failed to update quantity:', error);
            throw error;
        }
    },

    async removeItem(furnitureId: string) {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            const response = await cartAxios.delete(`/cart/item/${furnitureId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw error;
        }
    },

    async clearCart() {
        try {
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            const response = await cartAxios.delete('/cart/clear');
            return response.data;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw error;
        }
    },
}; 