import { Request, Response } from 'express';
import User from '../models/user.model';
import { createUserSession } from '../config/session';

export async function register(req: Request, res: Response): Promise<Response> {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with that email or username'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Create session data
        const userData = createUserSession(user);

        return res.status(201).json({
            message: 'User registered successfully',
            user: userData
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function login(req: Request, res: Response): Promise<Response> {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create session data
        const userData = createUserSession(user);

        return res.status(200).json({
            message: 'Login successful',
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function getProfile(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = (req as any).user;

        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}