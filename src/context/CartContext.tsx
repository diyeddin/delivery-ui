// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  product_id: number;
  store_id: number;
  store_name: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  // NEW: Control the drawer visibility
  isCartOpen: boolean; 
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mall_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  // NEW: State for the UI Drawer
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mall_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === newItem.product_id);
      if (existing) {
        return prev.map(item => 
          item.product_id === newItem.product_id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, newItem];
    });
    // UX Improvement: Auto-open drawer when adding an item
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product_id === productId ? { ...item, quantity: qty } : item
    ));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount,
      isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};