import React, { createContext, useContext, useEffect, useState } from 'react';

export const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const CART_STORAGE_KEY = "bakeryCart";

  const readStoredCart = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const buildCartSignature = (item) =>
    [
      item.productId || "",
      item.name || "",
      item.detail || "",
      item.price || 0,
      JSON.stringify(item.selectedOptions || []),
    ].join("|");

  const [cart, setCart] = useState(() => readStoredCart());

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage failures.
    }
  }, [cart]);

  const addToCart = (item) => {
    const quantity = Number(item.quantity || 1);
    const nextItem = {
      ...item,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    };
    const signature = buildCartSignature(nextItem);

    setCart((prev) => {
      const existingIndex = prev.findIndex((entry) => buildCartSignature(entry) === signature);
      if (existingIndex === -1) {
        return [...prev, { ...nextItem, cartId: Date.now() + Math.random() }];
      }

      return prev.map((entry, index) =>
        index === existingIndex
          ? { ...entry, quantity: Number(entry.quantity || 1) + nextItem.quantity }
          : entry,
      );
    });
  };

  const quickAdd = (product) => {
    addToCart({
      productId: product.id,
      bakeryId:  product.bakeryId,
      name:      product.name,
      detail:    product.description || '',
      price:     Number(product.basePrice || 0),
      icon:      product.type?.toLowerCase() || 'product',
      selectedOptions: [],
    });
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartItemQuantity = (cartId, quantity) => {
    const nextQuantity = Number(quantity);

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId !== cartId) return item;
          if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
            return null;
          }
          return { ...item, quantity: nextQuantity };
        })
        .filter(Boolean),
    );
  };

  const incrementCartItem = (cartId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity: Number(item.quantity || 1) + 1 } : item,
      ),
    );
  };

  const decrementCartItem = (cartId) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const nextQuantity = Number(item.quantity || 1) - 1;
          return nextQuantity <= 0 ? null : { ...item, quantity: nextQuantity };
        })
        .filter(Boolean),
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  // CheckoutPage destructures { state, clearCart } where state.cart is the array
  const state = { cart };

  return (
    <AppContext.Provider value={{
      cart,       // direct access: const { cart } = useApp()
      state,      // CheckoutPage access: const { state } = useApp() → state.cart
      addToCart,
      quickAdd,
      removeFromCart,
      updateCartItemQuantity,
      incrementCartItem,
      decrementCartItem,
      clearCart,
      cartTotal,
      cartCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};
