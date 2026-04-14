import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function CartPage() {
  const { state, removeFromCart } = useApp();

  if (state.cart.length === 0) {
    return (
      <div className="page active" id="page-cart">
        <div className="cart-page">
          <h1 className="cart-title">Your Cart</h1>
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <div className="cart-empty-text">Your cart is empty</div>
            <br />
            <Link to="/#cakes">
              <button className="btn-primary" style={{ margin: "0 auto", display: "block", width: "fit-content" }}>
                Browse Collection
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = state.cart.reduce((s, i) => s + i.price, 0);
  const delivery = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + delivery;

  return (
    <div className="page active" id="page-cart">
      <div className="cart-page">
        <h1 className="cart-title">Your Cart</h1>
        <div>
          <div className="cart-list">
            {state.cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-icon">{item.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-detail">{item.detail}</div>
                </div>
                <div className="cart-item-price">Rs {item.price.toLocaleString()}</div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            ))}
          </div>
          <div className="cart-summary-box">
            {delivery === 0 && <div className="discount-badge">✦ Free delivery on this order</div>}
            <div className="cart-summary-line">
              <span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-line">
              <span>Delivery</span><span>{delivery === 0 ? "Free" : `Rs ${delivery}`}</span>
            </div>
            <div className="cart-summary-line total">
              <span>Total</span><span>Rs {total.toLocaleString()}</span>
            </div>
            <button className="btn-checkout">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
