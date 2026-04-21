import React, { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "../api/orders";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Icon } from "../components/customize/Icons";
import "../styles/checkout.css";

export default function CheckoutPage() {
  const { state, clearCart } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRestricted = user?.role === "admin" || user?.role === "bakeryOwner";

  const [customerInfo, setCustomerInfo] = useState({
    name:         user?.name  || "",
    email:        user?.email || "",
    phone:        user?.contactNumber || "",
    address:      user?.address || "",
    city:         "",
    postalCode:   "",
    instructions: "",
  });

  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [paymentMethod,  setPaymentMethod]  = useState("cod");
  const [orderError,     setOrderError]     = useState("");
  const [orderSuccess,   setOrderSuccess]   = useState("");

  if (isRestricted) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/bakery/dashboard"} replace />;
  }
  if (state.cart.length === 0) return <Navigate to="/cart" replace />;
  if (!user)                   return <Navigate to="/" replace />;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const deliveryOptions = [
    { id: "standard", name: "Standard Delivery",  time: "2-3 business days",  price: 150 },
    { id: "express",  name: "Express Delivery",   time: "Next business day",  price: 300 },
    { id: "pickup",   name: "Store Pickup",        time: "Ready in 2 hours",   price: 0   },
  ];

  const paymentMethods = [
    { id: "cod",  name: "Cash on Delivery", icon: "cash" },
  ];

  const bakeryId        = state.cart[0]?.bakeryId;
  const selectedDelivery = deliveryOptions.find(o => o.id === deliveryOption);
  const deliveryFee     = selectedDelivery?.price ?? 150;
  const subtotal        = state.cart.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const finalTotal      = subtotal + deliveryFee;

  // ── Build the complete payload ─────────────────────────────────────────────
  const orderPayload = useMemo(() => {
    const items = state.cart.map((item) => ({
      productId: item.productId,
      quantity:  item.quantity || 1,
      ...(item.selectedOptions?.length ? { selectedOptions: item.selectedOptions } : {}),
    }));

    return {
      bakeryId,
      items,

      // delivery
      deliveryOption,
      deliveryFee,
      deliveryAddress: {
        street:     customerInfo.address,
        city:       customerInfo.city,
        postalCode: customerInfo.postalCode,
      },
      deliveryInstructions: customerInfo.instructions,

      // contact
      customerPhone: customerInfo.phone,

      // payment
      paymentMethod,
    };
  }, [bakeryId, state.cart, deliveryOption, deliveryFee, paymentMethod, customerInfo]);

  // ── Validate required fields before firing mutation ────────────────────────
  const validate = () => {
    if (!customerInfo.name.trim())  return "Full name is required.";
    if (!customerInfo.email.trim()) return "Email is required.";
    if (!customerInfo.phone.trim()) return "Phone number is required.";
    if (deliveryOption !== "pickup") {
      if (!customerInfo.address.trim())    return "Street address is required.";
      if (!customerInfo.city.trim())       return "City is required.";
    }
    return null;
  };

  const placeOrderMutation = useMutation({
    mutationFn: () => placeOrder(orderPayload),
    onSuccess: (data) => {
      setOrderSuccess(data?.message || "Order placed successfully.");
      setOrderError("");
      clearCart();
      setTimeout(() => navigate("/orders", { replace: true }), 800);
    },
    onError: (error) => {
      setOrderError(error?.data?.message || "Unable to place order. Please try again.");
      setOrderSuccess("");
    },
  });

  const handlePlaceOrder = () => {
    setOrderError("");
    setOrderSuccess("");
    const validationError = validate();
    if (validationError) {
      setOrderError(validationError);
      return;
    }
    placeOrderMutation.mutate();
  };

  return (
    <div className="page active" id="page-checkout">
      <div className="checkout-page">
        <div className="checkout-header">
          <h1 className="checkout-title">Checkout</h1>
          <div className="checkout-breadcrumb">
            <Link to="/cart">Cart</Link>
            <span> › </span>
            <span>Checkout</span>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">

            {/* Customer Information */}
            <div className="checkout-section">
              <h2 className="section-title">Customer Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input type="text" id="name" name="name" value={customerInfo.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" value={customerInfo.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input type="tel" id="phone" name="phone" value={customerInfo.phone} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            {/* Delivery Address — hidden for pickup */}
            {deliveryOption !== "pickup" && (
              <div className="checkout-section">
                <h2 className="section-title">Delivery Address</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="address">Street Address *</label>
                    <input type="text" id="address" name="address" value={customerInfo.address} onChange={handleInputChange} placeholder="House number, street name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input type="text" id="city" name="city" value={customerInfo.city} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input type="text" id="postalCode" name="postalCode" value={customerInfo.postalCode} onChange={handleInputChange} />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="instructions">Delivery Instructions</label>
                    <textarea id="instructions" name="instructions" value={customerInfo.instructions} onChange={handleInputChange} placeholder="Any special delivery instructions..." rows="3" />
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Options */}
            <div className="checkout-section">
              <h2 className="section-title">Delivery Options</h2>
              <div className="delivery-options">
                {deliveryOptions.map(option => (
                  <label key={option.id} className={`delivery-option ${deliveryOption === option.id ? "selected" : ""}`}>
                    <input type="radio" name="delivery" value={option.id} checked={deliveryOption === option.id} onChange={(e) => setDeliveryOption(e.target.value)} />
                    <div className="option-content">
                      <div className="option-name">{option.name}</div>
                      <div className="option-time">{option.time}</div>
                      <div className="option-price">{option.price === 0 ? "Free" : `Rs ${option.price}`}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2 className="section-title">Payment Method</h2>
              <div className="auth-success" style={{ marginBottom: 12 }}>
                We only accept cash on delivery for now.
              </div>
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <label key={method.id} className={`payment-method ${paymentMethod === method.id ? "selected" : ""}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="method-content">
                      <Icon name={method.icon} size={20} />
                      <span>{method.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>

              <div className="order-items">
                {state.cart.map(item => (
                  <div key={item.cartId || item.productId} className="order-item">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-detail">{item.detail}</div>
                      <div className="item-detail">Qty: {item.quantity || 1}</div>
                    </div>
                    <div className="item-price">Rs {(item.price * (item.quantity || 1)).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-line">
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className="total-line">
                  <span>{selectedDelivery?.name}</span>
                  <span>{deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`}</span>
                </div>
                <div className="total-line final">
                  <span>Total</span>
                  <span>Rs {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {!bakeryId  && <div className="auth-error"  style={{ marginTop: 12 }}>Missing bakery information.</div>}
              {orderError && <div className="auth-error"  style={{ marginTop: 12 }}>{orderError}</div>}
              {orderSuccess && <div className="auth-success" style={{ marginTop: 12 }}>{orderSuccess}</div>}

              <button
                className="btn-place-order"
                onClick={handlePlaceOrder}
                disabled={placeOrderMutation.isPending || !bakeryId}
              >
                {placeOrderMutation.isPending ? (
                  <><Icon name="spinner" size={16} /> Processing...</>
                ) : (
                  `Place Order - Rs ${finalTotal.toLocaleString()}`
                )}
              </button>

              <div className="checkout-security">
                <Icon name="lock" size={14} />
                <span>Secure checkout powered by SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
