import mongoose, { Schema, Document } from 'mongoose';

// Interfaces
export interface IElement {
    id: string;
    type: 'chair' | 'table' | 'sofa' | 'bed' | 'cabinet' | 'lamp';
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    color: string;
    shade: number;
}

export interface IRoom {
    width: number;
    length: number;
    height: number;
    shape: 'rectangular' | 'L-shaped' | 'custom';
    colorScheme: {
        walls: string;
        floor: string;
        ceiling: string;
    };
}

export interface IDesign extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    room: IRoom;
    elements: IElement[];
    createdAt: Date;
    updatedAt: Date;
}

// Schemas
const ElementSchema = new Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['chair', 'table', 'sofa', 'bed', 'cabinet', 'lamp']
    },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true }
    },
    rotation: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true }
    },
    scale: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true }
    },
    color: { type: String, required: true },
    shade: { type: Number, required: true }
});

const RoomSchema = new Schema({
    width: { type: Number, required: true, min: 1 },
    length: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    shape: {
        type: String,
        required: true,
        enum: ['rectangular', 'L-shaped', 'custom']
    },
    colorScheme: {
        walls: { type: String, required: true },
        floor: { type: String, required: true },
        ceiling: { type: String, required: true }
    }
});

const DesignSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        default: 'Untitled Design'
    },
    room: RoomSchema,
    elements: [ElementSchema]
}, {
    timestamps: true
});

// Indexes
DesignSchema.index({ userId: 1, name: 1 });

export default mongoose.model<IDesign>('Design', DesignSchema); 