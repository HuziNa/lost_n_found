import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { SAMPLE_ORDERS } from "../data/orders";
import { Icon } from "../components/ui/Icons";

function statusPill(s) {
  const map = { pending: "Pending", confirmed: "Confirmed", preparing: "Preparing", delivered: "Delivered", cancelled: "Cancelled" };
  return <span className={`status-pill status-${s}`}>{map[s] || s}</span>;
}

export default function OrdersPage() {
  const { state } = useApp();
  const { user, openAuthModal } = useAuth();
  const isRestricted = user?.role === "admin" || user?.role === "owner";

  if (isRestricted) {
    const redirectTo = user?.role === "admin" ? "/admin" : "/bakery/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  if (!user) {
    return (
      <div className="page active" id="page-orders">
        <div className="orders-page guest-orders-view">
          <div className="lock-icon">
            <Icon name="lock" size={48} />
          </div>
          <h1 className="orders-title">Members Only</h1>
          <p className="orders-sub">
            Please sign in to view your order history and track active orders.
          </p>
          <button className="btn-primary" onClick={() => openAuthModal("login")}>
            Sign In to Access
          </button>
        </div>
      </div>
    );
  }

  const cartOrders = state.cart.map(item => ({
    id: "SC-LIVE-" + item.id,
    date: "Just added to cart",
    name: item.name,
    items: [item.detail],
    price: item.price,
    status: "pending",
    timeline: [
      { label: "Order Placed", icon: "orders", active: true, time: "Now" },
      { label: "Confirmed", icon: "check", done: false, time: "—" },
      { label: "Preparing", icon: "cake", done: false, time: "—" },
      { label: "Out for Delivery", icon: "truck", done: false, time: "—" },
      { label: "Delivered", icon: "box", done: false, time: "—" },
    ],
  }));

  const allOrders = [...SAMPLE_ORDERS, ...cartOrders];

  return (
    <div className="page active" id="page-orders">
      <div className="orders-page">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-sub">
          Track your order in real time — from our bakery to your doorstep.
        </p>
        <div id="orders-list">
          {allOrders.map((order) => (
            <div className="order-status-card" key={order.id}>
              <div className="order-status-header">
                <div>
                  <div className="order-id">{order.id}</div>
                  <div className="order-date">{order.date}</div>
                </div>
                <div className="order-name">{order.name}</div>
                <div className="order-amount">Rs {order.price.toLocaleString()}</div>
                {statusPill(order.status)}
              </div>
              <div className="order-tracker">
                <div className="tracker-steps">
                  {order.timeline.map((step, idx) => (
                    <div className="tracker-step" key={idx}>
                      <div className={`tracker-line ${step.done && idx < order.timeline.length - 1 ? "done" : ""}`}></div>
                      <div className={`tracker-dot ${step.done ? "done" : step.active ? "active" : ""}`}>
                        {step.done ? <Icon name="check" size={14} /> : step.active ? <Icon name={step.icon} size={14} /> : null}
                      </div>
                      <div className={`tracker-label ${step.done ? "done" : step.active ? "active" : ""}`}>{step.label}</div>
                      <div className="tracker-time">{step.time}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-items-row">
                {order.items.map((it, idx) => (
                  <div className="order-item-chip" key={idx}>
                    <Icon name="cake" size={14} />
                    {it}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
