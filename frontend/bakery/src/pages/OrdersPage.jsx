import React from "react";
import { useApp } from "../context/AppContext";
import { SAMPLE_ORDERS } from "../data/orders";

function statusPill(s) {
  const map = { pending: "Pending", confirmed: "Confirmed", preparing: "Preparing", delivered: "Delivered", cancelled: "Cancelled" };
  return <span className={`status-pill status-${s}`}>{map[s] || s}</span>;
}

export default function OrdersPage() {
  const { state } = useApp();

  const cartOrders = state.cart.map(item => ({
    id: "SC-LIVE-" + item.id,
    date: "Just added to cart",
    name: item.name,
    items: [item.detail],
    price: item.price,
    status: "pending",
    timeline: [
      { label: "Order Placed", icon: "📋", active: true, time: "Now" },
      { label: "Confirmed", icon: "✅", done: false, time: "—" },
      { label: "Preparing", icon: "🎂", done: false, time: "—" },
      { label: "Out for Delivery", icon: "🚗", done: false, time: "—" },
      { label: "Delivered", icon: "📦", done: false, time: "—" },
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
                        {step.done ? "✓" : step.active ? step.icon : ""}
                      </div>
                      <div className={`tracker-label ${step.done ? "done" : step.active ? "active" : ""}`}>{step.label}</div>
                      <div className="tracker-time">{step.time}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-items-row">
                {order.items.map((it, idx) => (
                  <div className="order-item-chip" key={idx}>🎂 {it}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
