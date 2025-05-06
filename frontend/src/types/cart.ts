export interface CartItem {
    id: string;
    type: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
} 