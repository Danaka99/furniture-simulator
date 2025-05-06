import { Types } from 'mongoose';

export interface IUser {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}