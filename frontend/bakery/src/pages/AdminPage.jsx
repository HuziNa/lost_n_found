import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminBakeries, getTopOrdersBakery, getTopRevenueBakery, updateBakeryApproval } from "../api/admin";
import { Icon } from "../components/customize/Icons";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("applications");
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState("");

  const allBakeriesQuery = useQuery({
    queryKey: ["adminBakeries", "all"],
    queryFn: () => getAdminBakeries({}),
  });

  const pendingBakeriesQuery = useQuery({
    queryKey: ["adminBakeries", "pending"],
    queryFn: () => getAdminBakeries({ approvalStatus: "pending" }),
  });

  const listQuery = useMemo(() => {
    if (activeTab === "applications") {
      return pendingBakeriesQuery;
    }
    if (activeTab === "all") {
      return allBakeriesQuery;
    }
    return null;
  }, [activeTab, allBakeriesQuery, pendingBakeriesQuery]);

  const approvalMutation = useMutation({
    mutationFn: ({ bakeryId, status }) => updateBakeryApproval(bakeryId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminBakeries"] });
      setActionMessage(data?.message || "Application updated.");
    },
    onError: (error) => {
      setActionMessage(error?.data?.message || "Unable to update application.");
    },
  });

  const topOrdersQuery = useQuery({
    queryKey: ["topOrdersBakery"],
    queryFn: getTopOrdersBakery,
    enabled: activeTab === "performance",
  });

  const topRevenueQuery = useQuery({
    queryKey: ["topRevenueBakery"],
    queryFn: getTopRevenueBakery,
    enabled: activeTab === "performance",
  });

  const bakeries = listQuery?.data?.bakeries || [];
  const totalBakeries = allBakeriesQuery.data?.totalBakeries || 0;
  const pendingBakeries = pendingBakeriesQuery.data?.totalBakeries || 0;
  const listIsLoading = listQuery?.isLoading || false;
  const listIsError = listQuery?.isError || false;

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
              <div className="stat-value">
                {allBakeriesQuery.isLoading ? "-" : totalBakeries}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Pending Apps</div>
              <div className="stat-value">
                {pendingBakeriesQuery.isLoading ? "-" : pendingBakeries}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Top Rating</div>
              <div className="stat-value">-</div>
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
          {actionMessage && <div className="auth-success" style={{ marginBottom: "12px" }}>{actionMessage}</div>}
          {activeTab === "applications" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Pending Applications</h2>
                <span className="badge">{totalBakeries} Pending</span>
              </div>
              {listIsLoading && <div className="placeholder-box">Loading applications...</div>}
              {listIsError && <div className="placeholder-box">Unable to load applications.</div>}
              {!listIsLoading && bakeries.length === 0 && (
                <div className="placeholder-box">
                  <div className="placeholder-icon">
                    <Icon name="clipboard" size={44} />
                  </div>
                  <p>No new bakery applications at the moment.</p>
                </div>
              )}
              {bakeries.length > 0 && (
                <div className="admin-list">
                  {bakeries.map((bakery) => (
                    <div key={bakery.id} className="admin-list-row">
                      <div>
                        <div className="admin-list-title">{bakery.name}</div>
                        <div className="admin-list-sub">{bakery.address || "Address not provided"}</div>
                      </div>
                      <div className="admin-list-meta">
                        <button
                          className="btn-primary-sm"
                          onClick={() => approvalMutation.mutate({ bakeryId: bakery.id, status: "approved" })}
                          disabled={approvalMutation.isPending}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-outline-xs"
                          onClick={() => approvalMutation.mutate({ bakeryId: bakery.id, status: "rejected" })}
                          disabled={approvalMutation.isPending}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {listIsLoading && <div className="placeholder-box">Loading bakeries...</div>}
              {listIsError && <div className="placeholder-box">Unable to load bakeries.</div>}
              {!listIsLoading && bakeries.length === 0 && (
                <div className="placeholder-box">
                  <div className="placeholder-icon">
                    <Icon name="building" size={44} />
                  </div>
                  <p>No bakeries found.</p>
                </div>
              )}
              {bakeries.length > 0 && (
                <div className="admin-list">
                  {bakeries.map((bakery) => (
                    <div key={bakery.id} className="admin-list-row">
                      <div>
                        <div className="admin-list-title">{bakery.name}</div>
                        <div className="admin-list-sub">{bakery.address || "Address not provided"}</div>
                      </div>
                      <div className="admin-list-meta">
                        <span className={`badge ${bakery.isActive ? "active" : "inactive"}`}>
                          {bakery.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="badge">{bakery.approvalStatus || "-"}</span>
                        <span className="admin-list-metric">Orders: {bakery.orderStats?.totalOrders || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "performance" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Top Performing Bakeries</h2>
              </div>
              {(topOrdersQuery.isLoading || topRevenueQuery.isLoading) && (
                <div className="placeholder-box">Loading analytics...</div>
              )}
              {(topOrdersQuery.isError || topRevenueQuery.isError) && (
                <div className="placeholder-box">Unable to load analytics.</div>
              )}
              {!topOrdersQuery.isLoading && !topRevenueQuery.isLoading && (
                <div className="admin-list">
                  <div className="admin-list-row">
                    <div>
                      <div className="admin-list-title">Top Orders</div>
                      <div className="admin-list-sub">
                        {topOrdersQuery.data?.topOrdersBakery?.name || "No data"}
                      </div>
                    </div>
                    <div className="admin-list-meta">
                      <span className="badge">{topOrdersQuery.data?.topOrdersBakery?.orderStats?.totalOrders || 0} orders</span>
                    </div>
                  </div>
                  <div className="admin-list-row">
                    <div>
                      <div className="admin-list-title">Top Revenue</div>
                      <div className="admin-list-sub">
                        {topRevenueQuery.data?.topRevenueBakery?.name || "No data"}
                      </div>
                    </div>
                    <div className="admin-list-meta">
                      <span className="badge">
                        Rs {Number(topRevenueQuery.data?.topRevenueBakery?.orderStats?.totalRevenue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
