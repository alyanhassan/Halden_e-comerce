import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  addToCart,
  applyPromoCode,
  clearCart,
  getCart,
  moveItemToWishlist,
  removeCartItem,
  removePromoCode,
  setDeliveryMethod,
  updateCartItemQuantity,
} from '../services/cartService';
import { CartItem, CartSummary, DeliveryMethod } from '../types';
import { useWishlist } from './WishlistContext';

interface CartContextType {
  cart: CartSummary;
  itemCount: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  moveToWishlist: (id: string) => Promise<void>;
  changeDeliveryMethod: (method: DeliveryMethod) => Promise<void>;
  applyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromo: () => Promise<void>;
  clear: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const defaultSummary: CartSummary = {
  items: [],
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  promoCode: null,
  deliveryMethod: 'standard',
  qualifiesForFreeShipping: false,
  freeShippingThreshold: 120,
  amountNeededForFreeShipping: 120,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartSummary>(defaultSummary);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { refreshWishlist } = useWishlist();

  const refreshCart = async () => {
    const summary = await getCart();
    setCart(summary);
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    const updated = await addToCart(item);
    setCart(updated);
    setIsCartDrawerOpen(true);
  };

  const updateItemQuantity = async (id: string, quantity: number) => {
    const updated = await updateCartItemQuantity(id, quantity);
    setCart(updated);
  };

  const removeItem = async (id: string) => {
    const updated = await removeCartItem(id);
    setCart(updated);
  };

  const moveToWishlist = async (id: string) => {
    const updated = await moveItemToWishlist(id);
    setCart(updated);
    await refreshWishlist();
  };

  const changeDeliveryMethod = async (method: DeliveryMethod) => {
    const updated = await setDeliveryMethod(method);
    setCart(updated);
  };

  const applyPromo = async (code: string) => {
    const result = await applyPromoCode(code);
    setCart(result.summary);
    return { success: result.success, message: result.message };
  };

  const removePromo = async () => {
    const updated = await removePromoCode();
    setCart(updated);
  };

  const clear = async () => {
    await clearCart();
    await refreshCart();
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
        addItem,
        updateItemQuantity,
        removeItem,
        moveToWishlist,
        changeDeliveryMethod,
        applyPromo,
        removePromo,
        clear,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
