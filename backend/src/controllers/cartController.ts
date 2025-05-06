import { Request, Response } from 'express';
import Cart from '../models/cart.model';
import { IUser } from '../types/User';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
    user?: IUser & { _id: Types.ObjectId };
}

interface FurnitureItem {
    furnitureId: string;
    type: string;
    name: string;
    price: number;
    quantity: number;
}

// Get user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create empty cart if none exists
            const newCart = new Cart({ userId, items: [], total: 0 });
            await newCart.save();
            return res.json(newCart);
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
};

// Add/Update item in cart
export const updateCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { furnitureId, type, name, price, quantity } = req.body;

        console.log('Request body:', req.body);
        console.log('User ID:', userId);

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!furnitureId || !type || !name || typeof price !== 'number' || !quantity || quantity < 1) {
            return res.status(400).json({
                message: 'Invalid request data',
                required: {
                    furnitureId: 'string',
                    type: 'string',
                    name: 'string',
                    price: 'number',
                    quantity: 'number (>0)'
                },
                received: { furnitureId, type, name, price, quantity }
            });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [], total: 0 });
        }

        const cartItem = {
            id: furnitureId,
            type,
            name,
            price,
            quantity
        };

        const existingItemIndex = cart.items.findIndex(
            item => item.id === furnitureId
        );

        if (existingItemIndex > -1) {
            cart.updateItemQuantity(furnitureId, quantity);
        } else {
            cart.addItem(cartItem);
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error('Cart update error:', error);
        res.status(500).json({
            message: 'Error updating cart',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { furnitureId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.removeItem(furnitureId);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart', error });
    }
};

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.clearCart();
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error });
    }
}; 