import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBakeryCategory,
  createBakeryIngredient,
  createBakeryProduct,
  deleteBakeryProduct,
  getBakeryAnalytics,
  getBakeryCategories,
  getBakeryIngredients,
  getBakeryOrders,
  getBakeryProducts,
  getBakeryReviews,
  updateBakeryOrderStatus,
  updateBakeryCategory,
  updateBakeryProfile,
  updateBakeryProduct,
} from "../api/bakery";
import BakerySidebar from "../components/BakerySidebar";
import { Icon } from "../components/customize/Icons";
import { useAuth } from "../context/AuthContext";
import { getCategoryImage, setCategoryImage } from "../utils/categoryImages";

const ORDER_STATUSES = ["pending", "baking", "ready", "completed", "cancelled"];

export default function BakeryDashboard() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const bakeryId = user?.bakeryManaged?.id || null;

  const [activeTab, setActiveTab] = useState("overview");
  const [orderFilter, setOrderFilter] = useState("all");
  const [actionToast, setActionToast] = useState("");
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: "create", category: null });
  const [productModal, setProductModal] = useState({ open: false, mode: "create", product: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [ingredientForm, setIngredientForm] = useState({
    name: "",
    unit: "",
    pricePerUnit: "",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", imageUrl: "" });
  const [productForm, setProductForm] = useState({
    name: "",
    basePrice: "",
    type: "FIXED",
    categoryId: "",
    description: "",
    imageUrl: "",
    ingredientsText: "",
    isActive: true,
  });
  const [storyForm, setStoryForm] = useState("");
  const [quoteForm, setQuoteForm] = useState("");
  const [imageUrlForm, setImageUrlForm] = useState("");
  const [statsForm, setStatsForm] = useState({
    years: "",
    customers: "",
    recipes: "",
    baked: "",
  });
  const [formError, setFormError] = useState("");
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

  useEffect(() => {
    setStoryForm(user?.bakeryManaged?.myStory || "");
    setQuoteForm(user?.bakeryManaged?.storyQuote || "");
    setImageUrlForm(user?.bakeryManaged?.imageUrl || "");
    setStatsForm({
      years: user?.bakeryManaged?.statsYears || "",
      customers: user?.bakeryManaged?.statsCustomers || "",
      recipes: user?.bakeryManaged?.statsRecipes || "",
      baked: user?.bakeryManaged?.statsBaked || "",
    });
  }, [
    user?.bakeryManaged?.myStory,
    user?.bakeryManaged?.storyQuote,
    user?.bakeryManaged?.imageUrl,
    user?.bakeryManaged?.statsYears,
    user?.bakeryManaged?.statsCustomers,
    user?.bakeryManaged?.statsRecipes,
    user?.bakeryManaged?.statsBaked,
  ]);

  const analyticsQuery = useQuery({
    queryKey: ["bakeryAnalytics"],
    queryFn: getBakeryAnalytics,
    enabled: !!bakeryId,
  });

  const ingredientsQuery = useQuery({
    queryKey: ["bakeryIngredients"],
    queryFn: getBakeryIngredients,
    enabled: !!bakeryId,
  });

  const categoriesQuery = useQuery({
    queryKey: ["bakeryCategories"],
    queryFn: getBakeryCategories,
    enabled: !!bakeryId,
  });

  const productsQuery = useQuery({
    queryKey: ["bakeryProducts"],
    queryFn: getBakeryProducts,
    enabled: !!bakeryId,
  });

  const ordersQuery = useQuery({
    queryKey: ["bakeryOrders", orderFilter],
    queryFn: () => getBakeryOrders(orderFilter === "all" ? {} : { status: orderFilter }),
    enabled: !!bakeryId,
  });

  const reviewsQuery = useQuery({
    queryKey: ["bakeryOwnerReviews", bakeryId],
    queryFn: () => getBakeryReviews(bakeryId),
    enabled: !!bakeryId,
  });

  const createIngredientMutation = useMutation({
    mutationFn: createBakeryIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryIngredients"] });
      setIngredientModalOpen(false);
      setIngredientForm({ name: "", unit: "", pricePerUnit: "" });
      showActionToast("Ingredient created.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to create ingredient.");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createBakeryCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bakeryCategories"] });
      const categoryId = data?.category?.id;
      if (categoryId && categoryForm.imageUrl) {
        setCategoryImage(categoryId, categoryForm.imageUrl.trim());
      }
      setCategoryModal({ open: false, mode: "create", category: null });
      setCategoryForm({ name: "", imageUrl: "" });
      showActionToast("Category created.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to create category.");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, payload }) => updateBakeryCategory(categoryId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bakeryCategories"] });
      const categoryId = data?.category?.id || categoryModal.category?.id;
      if (categoryId && categoryForm.imageUrl) {
        setCategoryImage(categoryId, categoryForm.imageUrl.trim());
      }
      setCategoryModal({ open: false, mode: "create", category: null });
      setCategoryForm({ name: "", imageUrl: "" });
      showActionToast("Category updated.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to update category.");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createBakeryProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryProducts"] });
      setProductModal({ open: false, mode: "create", product: null });
      setProductForm({ name: "", basePrice: "", type: "FIXED", categoryId: "", isActive: true });
      showActionToast("Product created.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to create product.");
    },
  });
  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }) => updateBakeryProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryProducts"] });
      setProductModal({ open: false, mode: "create", product: null });
      setProductForm({ name: "", basePrice: "", type: "FIXED", categoryId: "", isActive: true });
      showActionToast("Product updated.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to update product.");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) => deleteBakeryProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryProducts"] });
      setDeleteModal({ open: false, product: null });
      showActionToast("Product deleted.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to delete product.");
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateBakeryOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryOrders"] });
      showActionToast("Order status updated.");
    },
  });

  const updateBakeryProfileMutation = useMutation({
    mutationFn: updateBakeryProfile,
    onSuccess: async () => {
      await refreshUser();
      showActionToast("Bakery profile updated.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to update bakery profile.");
    },
  });

  const analytics = analyticsQuery.data?.analytics || {};
  const ordersByStatus = analytics.ordersByStatus || {};
  const ingredients = ingredientsQuery.data?.ingredients || [];
  const categories = categoriesQuery.data?.categories || [];
  const products = productsQuery.data?.products || [];
  const orders = ordersQuery.data?.orders || [];
  const reviews = reviewsQuery.data?.reviews || [];

  const openCreateProductModal = () => {
    setFormError("");
    setProductForm({
      name: "",
      basePrice: "",
      type: "FIXED",
      categoryId: categories[0]?.id || "",
      description: "",
      imageUrl: "",
      ingredientsText: "",
      isActive: true,
    });
    setProductModal({ open: true, mode: "create", product: null });
  };

  const openCreateCategoryModal = () => {
    setFormError("");
    setCategoryForm({ name: "", imageUrl: "" });
    setCategoryModal({ open: true, mode: "create", category: null });
  };

  const openEditCategoryModal = (category) => {
    setFormError("");
    setCategoryForm({
      name: category.name || "",
      imageUrl: getCategoryImage(category.id) || "",
    });
    setCategoryModal({ open: true, mode: "edit", category });
  };

  const openEditProductModal = (product) => {
    setFormError("");
    setProductForm({
      name: product.name || "",
      basePrice: product.basePrice || "",
      type: product.type || "FIXED",
      categoryId: product.categoryId || categories[0]?.id || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      ingredientsText: product.ingredientsText || "",
      isActive: product.isActive !== false,
    });
    setProductModal({ open: true, mode: "edit", product });
  };

  const handleIngredientSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    const pricePerUnit =
      ingredientForm.pricePerUnit === "" ? undefined : Number(ingredientForm.pricePerUnit);

    createIngredientMutation.mutate({
      name: ingredientForm.name,
      unit: ingredientForm.unit,
      pricePerUnit,
    });
  };

  const handleCategorySubmit = (event) => {
    event.preventDefault();
    setFormError("");
    if (categoryModal.mode === "edit" && categoryModal.category) {
      updateCategoryMutation.mutate({
        categoryId: categoryModal.category.id,
        payload: { name: categoryForm.name },
      });
    } else {
      createCategoryMutation.mutate({ name: categoryForm.name });
    }
  };

  const handleProductSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    const payload = {
      name: productForm.name,
      basePrice: Number(productForm.basePrice || 0),
      type: productForm.type,
      categoryId: productForm.categoryId,
      description: productForm.description,
      imageUrl: productForm.imageUrl,
      ingredientsText: productForm.ingredientsText,
      isActive: productForm.isActive,
    };

    if (productModal.mode === "edit" && productModal.product) {
      updateProductMutation.mutate({ productId: productModal.product.id, payload });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const handleStorySubmit = (event) => {
    event.preventDefault();
    setFormError("");
    updateBakeryProfileMutation.mutate({
      myStory: storyForm,
      storyQuote: quoteForm,
      statsYears: statsForm.years,
      statsCustomers: statsForm.customers,
      statsRecipes: statsForm.recipes,
      statsBaked: statsForm.baked,
      imageUrl: imageUrlForm,
    });
  };

  const filteredOrders = orders;

  return (
    <div className="bakery-portal">
      <BakerySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bakeryLink={bakeryId ? `/bakery/${bakeryId}` : "/bakery"}
      />
      
      <main className="bakery-main">
        <header className="bakery-main-header">
          <div className="header-context">
            <h1 className="header-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="header-subtitle">Welcome back to your artisan workspace.</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary-sm" onClick={openCreateProductModal}>
              <Icon name="plus" className="btn-icon" />
              Add Product
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
                <span className="card-value">Rs {Number(analytics.totalRevenue || 0).toLocaleString()}</span>
                <span className="card-trend">Last 30 days</span>
              </div>
              <div className="stat-card-gold">
                <span className="card-label">Active Orders</span>
                <span className="card-value">{analytics.totalOrders || 0}</span>
                <span className="card-trend">
                  {ordersByStatus.pending || 0} pending / {ordersByStatus.completed || 0} completed
                </span>
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

          {activeTab === "ingredients" && (
            <div className="data-table-section">
              <div className="table-header">
                <h2>Ingredient Stock</h2>
                <button
                  className="btn-primary-sm"
                  onClick={() => {
                    setFormError("");
                    setIngredientModalOpen(true);
                  }}
                >
                  Add Ingredient
                </button>
              </div>
              {ingredientsQuery.isLoading && <div className="placeholder-box">Loading ingredients...</div>}
              {ingredientsQuery.isError && <div className="placeholder-box">Unable to load ingredients.</div>}
              {!ingredientsQuery.isLoading && ingredients.length === 0 && (
                <div className="placeholder-box">No ingredients yet.</div>
              )}
              {ingredients.length > 0 && (
                <table className="bakery-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Unit</th>
                      <th>Price / Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((item) => {
                      return (
                        <tr key={item.id}>
                          <td className="font-medium">{item.name}</td>
                          <td>{item.unit}</td>
                          <td>
                            {item.pricePerUnit !== undefined && item.pricePerUnit !== null
                              ? `Rs ${Number(item.pricePerUnit).toLocaleString()}`
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <>
              <div className="data-table-section" style={{ marginBottom: "32px" }}>
                <div className="table-header">
                  <div>
                    <h2>Categories</h2>
                    <p style={{ margin: "6px 0 0", color: "var(--ink-muted)", fontSize: "13px" }}>
                      Managed by admin. Select from the predefined list.
                    </p>
                  </div>
                </div>
                {categoriesQuery.isLoading && <div className="placeholder-box">Loading categories...</div>}
                {categoriesQuery.isError && <div className="placeholder-box">Unable to load categories.</div>}
                {!categoriesQuery.isLoading && categories.length === 0 && (
                  <div className="placeholder-box">No categories yet.</div>
                )}
                {categories.length > 0 && (
                  <table className="bakery-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="font-medium">{category.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="data-table-section">
                <div className="table-header">
                  <h2>Product Catalog</h2>
                  <button className="btn-primary-sm" onClick={openCreateProductModal}>
                    Add Product
                  </button>
                </div>
              {productsQuery.isLoading && <div className="placeholder-box">Loading products...</div>}
              {productsQuery.isError && <div className="placeholder-box">Unable to load products.</div>}
              {!productsQuery.isLoading && products.length === 0 && (
                <div className="placeholder-box">No products found.</div>
              )}
              {products.length > 0 && (
                <table className="bakery-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td className="font-medium">{prod.name}</td>
                        <td>{prod.type}</td>
                        <td>Rs {Number(prod.basePrice || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${prod.isActive ? "in-stock" : "low-stock"}`}>
                            {prod.isActive ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <button className="icon-btn" onClick={() => openEditProductModal(prod)}>
                            Edit
                          </button>
                          <button className="icon-btn" onClick={() => setDeleteModal({ open: true, product: prod })}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
                </div>
              </>
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
                    className={`btn-filter ${orderFilter === "pending" ? "active" : ""}`}
                    onClick={() => setOrderFilter("pending")}
                  >
                    Pending
                  </button>
                  <button
                    className={`btn-filter ${orderFilter === "completed" ? "active" : ""}`}
                    onClick={() => setOrderFilter("completed")}
                  >
                    Completed
                  </button>
                </div>
              </div>
              {ordersQuery.isLoading && <div className="placeholder-box">Loading orders...</div>}
              {ordersQuery.isError && <div className="placeholder-box">Unable to load orders.</div>}
              {!ordersQuery.isLoading && filteredOrders.length === 0 && (
                <div className="placeholder-box">No orders in this status.</div>
              )}
              {filteredOrders.length > 0 && (
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
                        <td>{order.customer?.name || "Customer"}</td>
                        <td>Rs {Number(order.totalAmount || order.totalPrice || 0).toLocaleString()}</td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</td>
                        <td>
                          <span className={`status-dot ${order.status}`}></span>
                          {order.status}
                        </td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(event) =>
                              updateOrderMutation.mutate({ orderId: order.id, status: event.target.value })
                            }
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-grid">
              {reviewsQuery.isLoading && <div className="placeholder-box">Loading reviews...</div>}
              {reviewsQuery.isError && <div className="placeholder-box">Unable to load reviews.</div>}
              {!reviewsQuery.isLoading && reviews.length === 0 && (
                <div className="placeholder-box">No reviews yet.</div>
              )}
              {reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-header">
                    <div className="review-meta">
                      <div className="review-name">{review.customer?.name || "Customer"}</div>
                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="review-date">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <div className="review-text">{review.comment}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-panel">
              <div className="settings-header">
                <h2>Bakery Profile</h2>
              </div>
              <div className="settings-grid">
                <label className="settings-field">
                  <span>Name</span>
                  <input type="text" value={user?.bakeryManaged?.name || ""} readOnly />
                </label>
                <label className="settings-field">
                  <span>Status</span>
                  <input type="text" value={user?.bakeryManaged?.isActive ? "Active" : "Inactive"} readOnly />
                </label>
                <label className="settings-field">
                  <span>Address</span>
                  <input type="text" value={user?.bakeryManaged?.address || ""} readOnly />
                </label>
                <label className="settings-field">
                  <span>Contact</span>
                  <input type="text" value={user?.bakeryManaged?.contactNumber || ""} readOnly />
                </label>
                <label className="settings-field settings-span">
                  <span>Bakery Image URL</span>
                  <input
                    type="text"
                    value={imageUrlForm}
                    onChange={(event) => setImageUrlForm(event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <label className="settings-field settings-span">
                  <span>Owner</span>
                  <textarea rows="2" value={user?.name || ""} readOnly></textarea>
                </label>
                <label className="settings-field settings-span">
                  <span>My Story</span>
                  <textarea
                    rows="6"
                    value={storyForm}
                    onChange={(event) => setStoryForm(event.target.value)}
                    placeholder="Share your bakery's story..."
                  ></textarea>
                </label>
                <label className="settings-field settings-span">
                  <span>Quote</span>
                  <textarea
                    rows="3"
                    value={quoteForm}
                    onChange={(event) => setQuoteForm(event.target.value)}
                    placeholder="Add a short quote for your bakery."
                  ></textarea>
                </label>
                <label className="settings-field">
                  <span>Years of Heritage</span>
                  <input
                    type="text"
                    value={statsForm.years}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, years: event.target.value }))
                    }
                    placeholder="115+"
                  />
                </label>
                <label className="settings-field">
                  <span>Happy Customers</span>
                  <input
                    type="text"
                    value={statsForm.customers}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, customers: event.target.value }))
                    }
                    placeholder="50K+"
                  />
                </label>
                <label className="settings-field">
                  <span>Unique Recipes</span>
                  <input
                    type="text"
                    value={statsForm.recipes}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, recipes: event.target.value }))
                    }
                    placeholder="200+"
                  />
                </label>
                <label className="settings-field">
                  <span>Baked Fresh Daily</span>
                  <input
                    type="text"
                    value={statsForm.baked}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, baked: event.target.value }))
                    }
                    placeholder="24/7"
                  />
                </label>
              </div>
              {formError && <div className="auth-error" style={{ marginTop: "12px" }}>{formError}</div>}
              <button
                className="btn-primary"
                style={{ marginTop: "16px" }}
                onClick={handleStorySubmit}
                disabled={updateBakeryProfileMutation.isPending}
              >
                {updateBakeryProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}
        </div>
      </main>

      {ingredientModalOpen && (
        <div className="auth-overlay" onClick={() => setIngredientModalOpen(false)}>
          <div className="auth-modal dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Add Ingredient</h3>
            <form onSubmit={handleIngredientSubmit}>
              <div className="auth-field">
                <label>Name</label>
                <input
                  value={ingredientForm.name}
                  onChange={(event) => setIngredientForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Unit</label>
                <select
                  value={ingredientForm.unit}
                  onChange={(event) => setIngredientForm((prev) => ({ ...prev, unit: event.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div className="auth-field">
                <label>Price Per Unit</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ingredientForm.pricePerUnit}
                  onChange={(event) =>
                    setIngredientForm((prev) => ({ ...prev, pricePerUnit: event.target.value }))
                  }
                  required
                />
              </div>
              {formError && <div className="auth-error">{formError}</div>}
              <button className="btn-primary" disabled={createIngredientMutation.isPending}>
                {createIngredientMutation.isPending ? "Saving..." : "Create Ingredient"}
              </button>
            </form>
          </div>
        </div>
      )}

      {categoryModal.open && (
        <div className="auth-overlay" onClick={() => setCategoryModal({ open: false, mode: "create", category: null })}>
          <div className="auth-modal dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{categoryModal.mode === "edit" ? "Edit Category" : "Add Category"}</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="auth-field">
                <label>Name</label>
                <input
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="auth-field">
                <label>Image URL</label>
                <input
                  value={categoryForm.imageUrl}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                  required
                />
              </div>
              {formError && <div className="auth-error">{formError}</div>}
              <button
                className="btn-primary"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending
                  ? "Saving..."
                  : categoryModal.mode === "edit"
                  ? "Save Category"
                  : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {productModal.open && (
        <div className="auth-overlay" onClick={() => setProductModal({ open: false, mode: "create", product: null })}>
          <div className="auth-modal dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{productModal.mode === "edit" ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleProductSubmit}>
              <div className="auth-field">
                <label>Name</label>
                <input
                  value={productForm.name}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Category ID</label>
                <select
                  value={productForm.categoryId}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <div className="auth-error" style={{ marginTop: "8px" }}>
                    No categories yet. Add one first.
                  </div>
                )}
              </div>
              <div className="auth-field">
                <label>Base Price</label>
                <input
                  type="number"
                  value={productForm.basePrice}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, basePrice: event.target.value }))}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Image URL</label>
                <input
                  value={productForm.imageUrl}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="auth-field">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Short product summary"
                ></textarea>
              </div>
              <div className="auth-field">
                <label>Ingredients Text</label>
                <textarea
                  rows="3"
                  value={productForm.ingredientsText}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, ingredientsText: event.target.value }))}
                  placeholder="Ingredient details shown on product page"
                ></textarea>
              </div>
              <div className="auth-field">
                <label>Type</label>
                <select
                  value={productForm.type}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="FIXED">FIXED</option>
                  <option value="CUSTOMIZABLE">CUSTOMIZABLE</option>
                </select>
              </div>
              <div className="auth-field">
                <label>Active</label>
                <select
                  value={productForm.isActive ? "true" : "false"}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, isActive: event.target.value === "true" }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              {formError && <div className="auth-error">{formError}</div>}
              <button
                className="btn-primary"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending ||
                  categories.length === 0
                }
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? "Saving..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="auth-overlay" onClick={() => setDeleteModal({ open: false, product: null })}>
          <div className="auth-modal dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete {deleteModal.product?.name}?</p>
            {formError && <div className="auth-error">{formError}</div>}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                className="btn-primary"
                onClick={() => deleteProductMutation.mutate(deleteModal.product?.id)}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? "Deleting..." : "Confirm"}
              </button>
              <button className="btn-outline" onClick={() => setDeleteModal({ open: false, product: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
