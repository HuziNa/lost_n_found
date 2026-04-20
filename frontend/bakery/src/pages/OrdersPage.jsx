import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { Icon } from "../components/customize/Icons";

function statusPill(s) {
  const map = {
    pending: "Pending",
    completed: "Completed",
    confirmed: "Confirmed",
    preparing: "Preparing",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return <span className={`status-pill status-${s}`}>{map[s] || s}</span>;
}

export default function OrdersPage() {
  const { user, openAuthModal } = useAuth();
  const isRestricted = user?.role === "admin" || user?.role === "bakeryOwner";

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

  const ordersQuery = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => getMyOrders(),
    enabled: !!user,
  });

  const orders = ordersQuery.data?.orders || [];

  return (
    <div className="page active" id="page-orders">
      <div className="orders-page">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-sub">
          Track your order in real time — from our bakery to your doorstep.
        </p>
        <div id="orders-list">
          {ordersQuery.isLoading && <div className="placeholder-box">Loading orders...</div>}
          {ordersQuery.isError && (
            <div className="placeholder-box">Unable to load orders. Please try again.</div>
          )}
          {!ordersQuery.isLoading && orders.length === 0 && (
            <div className="placeholder-box">No orders found yet.</div>
          )}
          {orders.map((order) => (
            <div className="order-status-card" key={order.id}>
              <div className="order-status-header">
                <div>
                  <div className="order-id">{order.id}</div>
                  <div className="order-date">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                  </div>
                </div>
                <div className="order-name">{order.bakery?.name || "Bakery"}</div>
                <div className="order-amount">Rs {(order.totalPrice || 0).toLocaleString()}</div>
                {statusPill(order.status)}
              </div>
              <div className="order-items-row">
                {(order.items || []).map((it, idx) => (
                  <div className="order-item-chip" key={idx}>
                    <Icon name="cake" size={14} />
                    {it.product?.name || "Item"} × {it.quantity}
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
