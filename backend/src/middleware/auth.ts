import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../types/User';

interface AuthRequest extends Request {
    user?: IUser & { _id: string };
}

const JWT_SECRET = process.env.JWT_SECRET || 'ksdjhafjkadhsfy##kjshdakhsdhaskldhaksdh';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as IUser & { _id: string };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}; 