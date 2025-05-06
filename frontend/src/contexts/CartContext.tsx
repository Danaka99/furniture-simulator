import React, { createContext, useContext, useState, useEffect } from "react";
import { cartService, CartItem } from "../services/cartService";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (furnitureId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  updateQuantity: (furnitureId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("CartContext: Fetching cart...");
      const cartData = await cartService.getCart();
      console.log("CartContext: Received cart data:", cartData);

      // Ensure we have a valid items array
      const cartItems = cartData?.items || [];
      if (!Array.isArray(cartItems)) {
        console.error("Invalid cart items structure:", cartItems);
        setItems([]);
      } else {
        setItems(cartItems);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch cart";
      console.error("CartContext: Error fetching cart:", errorMsg);
      setError(errorMsg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh the cart
  const refreshCart = async () => {
    await fetchCart();
  };

  useEffect(() => {
    console.log("CartContext: Authentication state changed:", isAuthenticated);
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (item: CartItem) => {
    setLoading(true);
    setError(null);
    try {
      console.log("CartContext: Adding item to cart:", item);
      await cartService.updateCart(item);
      await fetchCart(); // Refresh cart after adding item
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to add item to cart";
      setError(errorMsg);
      console.error("CartContext: Error adding to cart:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (furnitureId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("CartContext: Removing item from cart:", furnitureId);
      await cartService.removeItem(furnitureId);
      await fetchCart(); // Refresh cart after removing item
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to remove item from cart";
      setError(errorMsg);
      console.error("CartContext: Error removing from cart:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("CartContext: Clearing cart");
      await cartService.clearCart();
      setItems([]);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to clear cart";
      setError(errorMsg);
      console.error("CartContext: Error clearing cart:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (furnitureId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log("CartContext: Updating quantity:", { furnitureId, quantity });
      await cartService.updateQuantity(furnitureId, quantity);
      await fetchCart(); // Refresh cart after updating quantity
    } catch (err: any) {
      const errorMsg = err.message || "Failed to update quantity";
      setError(errorMsg);
      console.error("CartContext: Error updating quantity:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        loading,
        error,
        refreshCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
