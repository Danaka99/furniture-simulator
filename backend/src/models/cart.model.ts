import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    id: string;
    type: string;
    name: string;
    price: number;
    quantity: number;
}

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    total: number;
    createdAt: Date;
    updatedAt: Date;
    calculateTotal(): number;
    addItem(item: Partial<ICartItem>): void;
    removeItem(itemId: string): void;
    updateItemQuantity(itemId: string, quantity: number): void;
    clearCart(): void;
}

const CartItemSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [CartItemSchema],
    total: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate total
CartSchema.methods.calculateTotal = function (this: ICart): number {
    this.total = this.items.reduce((sum: number, item: ICartItem) => sum + (item.price * item.quantity), 0);
    return this.total;
};

// Add item to cart
CartSchema.methods.addItem = function (this: ICart, item: Partial<ICartItem>): void {
    const existingItem = this.items.find((i: ICartItem) => i.id === item.id);

    if (existingItem) {
        existingItem.quantity += item.quantity || 1;
    } else {
        this.items.push(item as ICartItem);
    }

    this.calculateTotal();
};

// Remove item from cart
CartSchema.methods.removeItem = function (this: ICart, itemId: string): void {
    this.items = this.items.filter((item: ICartItem) => item.id !== itemId);
    this.calculateTotal();
};

// Update item quantity
CartSchema.methods.updateItemQuantity = function (this: ICart, itemId: string, quantity: number): void {
    const item = this.items.find((i: ICartItem) => i.id === itemId);
    if (item) {
        item.quantity = quantity;
        this.calculateTotal();
    }
};

// Clear cart
CartSchema.methods.clearCart = function (this: ICart): void {
    this.items = [];
    this.total = 0;
};

// Pre-save middleware to calculate total
CartSchema.pre('save', function (this: ICart, next) {
    this.calculateTotal();
    next();
});

export default mongoose.model<ICart>('Cart', CartSchema); 