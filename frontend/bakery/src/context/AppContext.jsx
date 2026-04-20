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
  const [toastMessage, setToastMessage] = useState("Item added to cart");

  // Update specific field in state
  const updateState = (field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const showToast = (message) => {
    if (message) {
      setToastMessage(message);
    }
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
      return {
        type: "success",
        message: `${upperCode} applied - ${VOUCHERS[upperCode]}% off.`,
      };
    }

    setState((prev) => ({
      ...prev,
      discount: 0,
      voucherCode: "",
    }));
    return { type: "error", message: "Invalid voucher code." };
  };

  const addToCart = (item) => {
    let didAdd = false;
    let blocked = false;

    setState((prev) => {
      if (!item?.productId || !item?.bakeryId) {
        blocked = true;
        return prev;
      }

      if (prev.cart.length > 0 && prev.cart[0].bakeryId !== item.bakeryId) {
        blocked = true;
        return prev;
      }

      const nextCart = [...prev.cart];
      const existingIndex = nextCart.findIndex(
        (entry) =>
          entry.productId === item.productId &&
          JSON.stringify(entry.selectedOptions || []) ===
            JSON.stringify(item.selectedOptions || [])
      );

      if (existingIndex >= 0) {
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: (nextCart[existingIndex].quantity || 1) + (item.quantity || 1),
        };
      } else {
        nextCart.push({
          ...item,
          id: Date.now() + Math.random(),
          quantity: item.quantity || 1,
        });
      }

      didAdd = true;
      return { ...prev, cart: nextCart };
    });

    if (blocked) {
      showToast(
        item?.productId && item?.bakeryId
          ? "Orders can only include one bakery at a time."
          : "This item is not linked to a bakery product yet."
      );
      return;
    }

    if (didAdd) {
      showToast("Item added to cart");
    }
  };

  const removeFromCart = (id) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.id !== id),
    }));
  };

  const clearCart = () => {
    setState((prev) => ({
      ...prev,
      cart: [],
    }));
  };

  const quickAdd = (product) => {
    if (!product) return;
    addToCart({
      productId: product.id,
      bakeryId: product.bakeryId || product.bakery?.id,
      name: product.name,
      detail: product.type === "CUSTOMIZABLE" ? "Customize order" : "Standard",
      price: product.basePrice,
      icon: "cake",
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
        clearCart,
        toastVisible,
        toastMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
