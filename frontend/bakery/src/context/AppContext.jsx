import React, { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart(prev => [...prev, { ...item, cartId: Date.now() + Math.random() }]);
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

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const cartCount = cart.length;

  // CheckoutPage destructures { state, clearCart } where state.cart is the array
  const state = { cart };

  return (
    <AppContext.Provider value={{
      cart,       // direct access: const { cart } = useApp()
      state,      // CheckoutPage access: const { state } = useApp() → state.cart
      addToCart,
      quickAdd,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};
