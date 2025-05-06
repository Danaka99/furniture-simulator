import mongoose, { Document } from 'mongoose';

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: Array<{
        furnitureId: mongoose.Types.ObjectId;
        quantity: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}