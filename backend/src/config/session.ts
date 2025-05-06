import { UserDocument } from '../models/user.model';

// Simple session management for basic auth without JWT
export function createUserSession(user: UserDocument): Record<string, any> {
    return {
        userId: user._id,
        username: user.username,
        email: user.email
    };
}
