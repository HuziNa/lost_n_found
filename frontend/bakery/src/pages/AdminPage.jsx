import React, { useState } from "react";
import { Icon } from "../components/ui/Icons";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("applications");

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-main">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage and oversee the bakery marketplace network.</p>
          </div>
          
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-label">Total Bakeries</div>
              <div className="stat-value">0</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Pending Apps</div>
              <div className="stat-value">0</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Top Rating</div>
              <div className="stat-value">N/A</div>
            </div>
          </div>
        </header>

        <nav className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            Applications
          </button>
          <button 
            className={`admin-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Bakeries
          </button>
          <button 
            className={`admin-tab ${activeTab === "performance" ? "active" : ""}`}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </button>
        </nav>

        <div className="admin-content">
          {activeTab === "applications" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Pending Applications</h2>
                <span className="badge">0 Pending</span>
              </div>
              <div className="placeholder-box">
                <div className="placeholder-icon">
                  <Icon name="clipboard" size={44} />
                </div>
                <p>No new bakery applications at the moment.</p>
              </div>
            </div>
          )}

          {activeTab === "all" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Bakeries Network</h2>
                <div className="section-actions">
                  <input type="text" placeholder="Search bakeries..." className="admin-search-input" disabled />
                  <select className="admin-filter-select" disabled>
                    <option>All Statuses</option>
                  </select>
                </div>
              </div>
              <div className="placeholder-box">
                <div className="placeholder-icon">
                  <Icon name="building" size={44} />
                </div>
                <p>Waiting for bakery records from the backend...</p>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Top Performing Bakeries</h2>
              </div>
              <div className="placeholder-box">
                <div className="placeholder-icon">
                  <Icon name="star" size={44} />
                </div>
                <p>Analytics will be available once the backend is connected.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
