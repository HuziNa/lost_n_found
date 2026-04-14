import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { state } = useApp();
  const location = useLocation();

  const handleCollectionScroll = (e) => {
    if (location.pathname === "/home" || location.pathname === "/") {
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
            La Bake<span>Maison</span>
          </div>
          <div className="nav-tagline">The Classic Baking Tradition</div>
        </Link>
        <div className="nav-divider"></div>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Bakeries
          </Link>
          <Link
            to="/home"
            className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/home#cakes"
            className="nav-link"
            onClick={handleCollectionScroll}
          >
            Collection
          </Link>
          <Link
            to="/customize"
            className={`nav-link ${location.pathname === "/customize" ? "active" : ""}`}
          >
            Bespoke
          </Link>
          <Link
            to="/orders"
            className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`}
          >
            Orders
          </Link>
        </div>
        <Link to="/cart" className="nav-cta">
          ✦ Cart
          {state.cart.length > 0 && (
            <span
              id="cart-count-badge"
              style={{
                background: "var(--gold)",
                color: "white",
                fontSize: "9px",
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              {state.cart.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
