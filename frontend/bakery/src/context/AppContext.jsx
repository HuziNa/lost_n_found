import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const VOUCHERS = { SWEET10: 10, CAKE20: 20, BAKE15: 15 };

const initialState = {
  size: { name: 'Medium 8"', price: 850 },
  layers: { count: 2, extra: 150 },
  frost: { flavor: "Strawberry", price: 100 },
  frostColor: "Cream",
  toppings: [],
  message: "",
  font: "cursive",
  decos: [],
  numCandle: 1,
  discount: 0,
  voucherCode: "",
  cart: [],
};

export function AppProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [toastVisible, setToastVisible] = useState(false);

  // Update specific field in state
  const updateState = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const calcTotal = () => {
    const toppingTotal = state.toppings.reduce((s, t) => s + t.price, 0);
    const decoTotal = state.decos.reduce((s, d) => s + d.price, 0);
    const subtotal =
      state.size.price +
      state.layers.extra +
      state.frost.price +
      toppingTotal +
      decoTotal;
    const discountAmt = Math.round((subtotal * state.discount) / 100);
    return { subtotal, discountAmt, total: subtotal - discountAmt };
  };

  const applyVoucher = (code) => {
    const upperCode = code.toUpperCase().trim();
    if (VOUCHERS[upperCode]) {
      setState((prev) => ({
        ...prev,
        discount: VOUCHERS[upperCode],
        voucherCode: upperCode,
      }));
      return `✓ ${upperCode} applied — ${VOUCHERS[upperCode]}% off!`;
    } else {
      setState((prev) => ({
        ...prev,
        discount: 0,
        voucherCode: "",
      }));
      return "✗ Invalid voucher code.";
    }
  };

  const addToCart = (item) => {
    setState((prev) => ({
      ...prev,
      cart: [...prev.cart, { ...item, id: Date.now() }],
    }));
    showToast();
  };

  const removeFromCart = (id) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.id !== id),
    }));
  };

  const quickAdd = (name, price) => {
    addToCart({
      name,
      detail: "Standard size",
      price,
      emoji: "🎂",
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updateState,
        calcTotal,
        applyVoucher,
        addToCart,
        removeFromCart,
        quickAdd,
        toastVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
