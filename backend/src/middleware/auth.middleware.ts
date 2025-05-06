import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

export interface AuthRequest extends Request {
    user?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        // Get basic auth credentials
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Basic ')) {
            res.status(401).json({ message: 'Access denied. No credentials provided.' });
            return;
        }

        // Decode base64 encoded credentials (username:password)
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        // Find user and validate password
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        // Attach user to request
        req.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}