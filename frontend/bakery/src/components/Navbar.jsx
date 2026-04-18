import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { state } = useApp();
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();

  const handleCollectionScroll = (e) => {
    if (location.pathname.startsWith("/bakery")) {
      e.preventDefault();
      const cakesSection = document.getElementById("cakes");
      if (cakesSection) {
        cakesSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="nav">
      <div className="nav-ornament"></div>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <div className="nav-logo">
            <span>Artisan</span> Bakeries
          </div>
          <div className="nav-tagline">The Classic Baking Tradition</div>
        </Link>

        {/* Global Navigation Links (Always Visible) */}
        <div className="nav-links">
          <div className="nav-links-inner">
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              Home
            </Link>
            {location.pathname.startsWith("/bakery") && (
              <Link
                to="#cakes"
                className="nav-link"
                onClick={handleCollectionScroll}
              >
                Collection
              </Link>
            )}
            <Link
              to="/orders"
              className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`}
            >
              Orders
            </Link>
            {user ? (
              <button className="nav-link logout-btn" onClick={() => logout()}>
                LOGOUT ({user.name.split(" ")[0]})
              </button>
            ) : (
              <button className="nav-link" onClick={() => openAuthModal()}>
                Login
              </button>
            )}
          </div>
        </div>

        {/* Action Group: Permanent Cart (Far Right) */}
        <div className="nav-actions">
          <Link to="/cart" className="nav-cta-header">
            ✦ Cart
            {state.cart.length > 0 && <span className="cart-badge">{state.cart.length}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
