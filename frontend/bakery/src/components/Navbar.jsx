import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./customize/Icons";

export default function Navbar() {
  const { state } = useApp();
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const isRestricted = user?.role === "admin" || user?.role === "bakeryOwner";

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

        {/* Dynamic Navigation Links */}
        <div className="nav-links">
          <div className="nav-links-inner">
            {location.pathname.startsWith("/admin") ? (
              <>
                <Link to="/admin" className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}>
                  Dashboard
                </Link>
                <Link to="/" className="nav-link">
                  Site View
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                  Home
                </Link>
                {location.pathname.startsWith("/bakery") && (
                  <Link to="#cakes" className="nav-link" onClick={handleCollectionScroll}>
                    Collection
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link to="/admin" className="nav-link admin-portal-link">
                    Admin Portal
                  </Link>
                )}
                {user?.role === "bakeryOwner" && user?.bakeryManaged?.isActive && (
                  <Link to="/bakery/dashboard" className="nav-link admin-portal-link">
                    My Bakery
                  </Link>
                )}
                {user && user.role !== "admin" && (
                  <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>
                    Profile
                  </Link>
                )}
                {!isRestricted && (
                  <Link to="/orders" className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`}>
                    Orders
                  </Link>
                )}
              </>
            )}

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

        {/* Action Group: Permanent Cart (Far Right) - Hidden in Admin Dashboard */}
        <div className="nav-actions">
          {!location.pathname.startsWith("/admin") && !isRestricted && (
            <Link to="/cart" className="nav-cta-header">
              <span className="nav-link-icon">
                <Icon name="cart" size={16} />
              </span>
              Cart
              {state.cart.length > 0 && <span className="cart-badge">{state.cart.length}</span>}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
