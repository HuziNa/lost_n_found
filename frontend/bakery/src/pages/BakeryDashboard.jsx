import React, { useEffect, useRef, useState } from "react";
import BakerySidebar from "../components/BakerySidebar";
import { Icon } from "../components/customize/Icons";
import { BAKERIES } from "../data/bakeries";

const MOCK_PRODUCTS = [
  { id: 1, name: "Vintage Vanilla Cake", price: 45, stock: 5, category: "Cakes", status: "In Stock" },
  { id: 2, name: "Artisan Sourdough", price: 12, stock: 2, category: "Bread", status: "Low Stock" },
  { id: 3, name: "Gold Leaf Macarons", price: 28, stock: 15, category: "Pastries", status: "In Stock" },
];

const MOCK_ORDERS = [
  { id: "ORD-1201", customer: "John Doe", total: 45, status: "Preparing", date: "2 mins ago" },
  { id: "ORD-1202", customer: "Jane Smith", total: 120, status: "Pending", date: "15 mins ago" },
];

export default function BakeryDashboard() {
  const bakeryId = 1;
  const profileStorageKey = `bakeryProfile_${bakeryId}`;
  const baseBakery = BAKERIES.find((b) => b.id === bakeryId) || BAKERIES[0];

  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [orderFilter, setOrderFilter] = useState("all");
  const [actionToast, setActionToast] = useState("");
  const [bakeryProfile, setBakeryProfile] = useState(() => {
    let storedProfile = null;
    try {
      const raw = localStorage.getItem(profileStorageKey);
      storedProfile = raw ? JSON.parse(raw) : null;
    } catch (error) {
      storedProfile = null;
    }

    return {
      id: bakeryId,
      name: baseBakery.name || "",
      category: baseBakery.category || "",
      address: baseBakery.address || "",
      desc: baseBakery.desc || "",
      rating: baseBakery.rating || 0,
      img: baseBakery.img || "",
      fallbackBg: baseBakery.fallbackBg || "",
      ...(storedProfile || {}),
    };
  });
  const toastTimer = useRef(null);

  const showActionToast = (message) => {
    setActionToast(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setActionToast(""), 2000);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const handleQuickAdd = () => {
    const newProduct = {
      id: Date.now(),
      name: "Signature Honey Cake",
      price: 38,
      stock: 6,
      category: "Cakes",
      status: "In Stock",
    };
    setProducts((prev) => [newProduct, ...prev]);
    setActiveTab("products");
    showActionToast("Added a new product to inventory.");
  };

  const handleEditProduct = (productId) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const nextStock = prod.stock + 1;
        const nextStatus = nextStock <= 3 ? "Low Stock" : "In Stock";
        return { ...prod, stock: nextStock, status: nextStatus };
      })
    );
    showActionToast("Updated stock count.");
  };

  const handleUpdateOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    const flow = ["Pending", "Preparing", "Ready"];
    const currentIndex = order ? flow.indexOf(order.status) : 0;
    const nextStatus = flow[(currentIndex + 1) % flow.length];

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus, date: "Just now" } : o))
    );
    showActionToast(`Order ${orderId} moved to ${nextStatus}.`);
  };

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === orderFilter);

  const updateBakeryProfile = (field, value) => {
    setBakeryProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    localStorage.setItem(profileStorageKey, JSON.stringify(bakeryProfile));
    showActionToast("Bakery profile updated.");
  };

  return (
    <div className="bakery-portal">
      <BakerySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bakeryLink={`/bakery/${bakeryProfile.id || bakeryId}`}
      />
      
      <main className="bakery-main">
        <header className="bakery-main-header">
          <div className="header-context">
            <h1 className="header-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="header-subtitle">Welcome back to your artisan workspace.</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary-sm" onClick={handleQuickAdd}>
              <Icon name="plus" className="btn-icon" />
              Quick Add Product
            </button>
            <div className="bakery-status">
              <span className="pips active"></span> Live
            </div>
          </div>
        </header>

        {actionToast && <div className="dashboard-toast">{actionToast}</div>}

        <div className="bakery-content">
          {activeTab === "overview" && (
            <div className="dashboard-grid">
              <div className="stat-card-gold">
                <span className="card-label">Daily Revenue</span>
                <span className="card-value">$1,240.00</span>
                <span className="card-trend positive">+12% from yesterday</span>
              </div>
              <div className="stat-card-gold">
                <span className="card-label">Active Orders</span>
                <span className="card-value">12</span>
                <span className="card-trend">4 pending approval</span>
              </div>
              <div className="stat-card-gold highlight">
                <span className="card-label">Expiring Stock</span>
                <span className="card-value">3 items</span>
                <span className="card-trend negative">Urgent restock needed</span>
              </div>

              <div className="chart-placeholder">
                <div className="chart-header">
                  <h3>Revenue Trends</h3>
                  <div className="chart-period">Last 7 Days</div>
                </div>
                <div className="chart-visual">
                  {/* Visual placeholder for a graph */}
                  <div className="mock-bar-container">
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <div key={i} className="mock-bar" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="data-table-section">
              <div className="table-header">
                <h2>Inventory Management</h2>
                <input type="text" placeholder="Search products..." className="table-search" />
              </div>
              <table className="bakery-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td className="font-medium">{prod.name}</td>
                      <td>{prod.category}</td>
                      <td>${prod.price}</td>
                      <td>{prod.stock} units</td>
                      <td>
                        <span className={`badge ${prod.status.toLowerCase().replace(" ", "-")}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td>
                        <button className="icon-btn" onClick={() => handleEditProduct(prod.id)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="data-table-section">
              <div className="table-header">
                <h2>Active Orders</h2>
                <div className="table-filters">
                  <button
                    className={`btn-filter ${orderFilter === "all" ? "active" : ""}`}
                    onClick={() => setOrderFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn-filter ${orderFilter === "preparing" ? "active" : ""}`}
                    onClick={() => setOrderFilter("preparing")}
                  >
                    Preparing
                  </button>
                  <button
                    className={`btn-filter ${orderFilter === "ready" ? "active" : ""}`}
                    onClick={() => setOrderFilter("ready")}
                  >
                    Ready
                  </button>
                </div>
              </div>
              <table className="bakery-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>${order.total}</td>
                      <td>{order.date}</td>
                      <td>
                        <span className={`status-dot ${order.status.toLowerCase()}`}></span>
                        {order.status}
                      </td>
                      <td>
                        <button className="btn-outline-xs" onClick={() => handleUpdateOrder(order.id)}>
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-grid">
              <div className="placeholder-box">
                <h3>Customer Feedback</h3>
                <p>Loading recent reviews...</p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-panel">
              <div className="settings-header">
                <h2>Bakery Profile</h2>
                <button className="btn-outline-xs" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
              <div className="settings-grid">
                <label className="settings-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={bakeryProfile.name}
                    onChange={(e) => updateBakeryProfile("name", e.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>Category</span>
                  <input
                    type="text"
                    value={bakeryProfile.category}
                    onChange={(e) => updateBakeryProfile("category", e.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>Address</span>
                  <input
                    type="text"
                    value={bakeryProfile.address}
                    onChange={(e) => updateBakeryProfile("address", e.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>Rating</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={bakeryProfile.rating}
                    onChange={(e) => {
                      const next = parseFloat(e.target.value);
                      updateBakeryProfile("rating", Number.isNaN(next) ? "" : next);
                    }}
                  />
                </label>
                <label className="settings-field settings-span">
                  <span>Description</span>
                  <textarea
                    rows="4"
                    value={bakeryProfile.desc}
                    onChange={(e) => updateBakeryProfile("desc", e.target.value)}
                  ></textarea>
                </label>
                <label className="settings-field settings-span">
                  <span>Hero Image URL</span>
                  <input
                    type="text"
                    value={bakeryProfile.img}
                    onChange={(e) => updateBakeryProfile("img", e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
