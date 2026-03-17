import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { profile } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!profile) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (courseName) => {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Failed to add to cart');
    setCartItems(data.cart.items || []);
    return data;
  }, []);

  const removeFromCart = useCallback(async (courseName) => {
    const res = await fetch('/api/cart/remove', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Failed to remove from cart');
    setCartItems(data.cart.items || []);
  }, []);

  const clearCart = useCallback(async () => {
    await fetch('/api/cart/clear', { method: 'DELETE', credentials: 'include' });
    setCartItems([]);
  }, []);

  const placeOrder = useCallback(async () => {
    const res = await fetch('/api/order/place', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Failed to place order');
    setCartItems([]);
    return data;
  }, []);

  const cartCount = cartItems.length;
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const value = useMemo(() => ({
    cartItems,
    cartCount,
    totalPrice,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    placeOrder,
    refreshCart: fetchCart,
  }), [cartItems, cartCount, totalPrice, loading, addToCart, removeFromCart, clearCart, placeOrder, fetchCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
