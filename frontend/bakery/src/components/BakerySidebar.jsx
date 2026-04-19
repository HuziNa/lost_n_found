import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./customize/Icons";

export default function BakerySidebar({ activeTab, setActiveTab, bakeryLink = "/bakery/1" }) {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "overview", label: "Overview", icon: "chart" },
    { id: "products", label: "Inventory", icon: "inventory" },
    { id: "orders", label: "Active Orders", icon: "orders" },
    { id: "reviews", label: "Reviews", icon: "reviews" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className={`bakery-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-dot"></div>
        <span>Artisan Portal</span>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="link-icon">
              <Icon name={item.icon} />
            </span>
            <span className="link-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-divider"></div>
      <Link className="sidebar-link sidebar-view" to={bakeryLink}>
        <span className="link-icon">
          <Icon name="store" />
        </span>
        <span className="link-label">View Bakery Page</span>
      </Link>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={() => logout()}>
          <span className="link-icon">
            <Icon name="logout" />
          </span>
          <span className="link-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
