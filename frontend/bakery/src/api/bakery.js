import { apiRequest, buildQueryString } from "./client";

export const getBakeryMenuProducts = async (bakeryId, params = {}) => {
  const query = buildQueryString(params);
  return apiRequest(`/bakery/menu/${bakeryId}/products${query}`);
};

export const getBakeryMenuProduct = async (productId) =>
  apiRequest(`/bakery/products/${productId}`);

export const getPublicBakeries = async () => apiRequest("/bakery/public");

export const getBakeryIngredients = async () => apiRequest("/bakery/ingredients");

export const getBakeryCategories = async (bakeryId) => {
  if (typeof bakeryId === "string" && bakeryId.trim()) {
    return apiRequest(`/bakery/categories/public/${bakeryId}`);
  }
  return apiRequest("/bakery/categories");
};

export const createBakeryCategory = async (payload) =>
  apiRequest("/bakery/categories", {
    method: "POST",
    body: payload,
  });

export const updateBakeryCategory = async (categoryId, payload) =>
  apiRequest(`/bakery/categories/${categoryId}`, {
    method: "PATCH",
    body: payload,
  });

export const updateBakeryProfile = async (payload) =>
  apiRequest("/bakery/profile", {
    method: "PATCH",
    body: payload,
  });

export const createBakeryIngredient = async (payload) =>
  apiRequest("/bakery/ingredients", {
    method: "POST",
    body: payload,
  });

export const updateBakeryIngredient = async (ingredientId, payload) =>
  apiRequest(`/bakery/ingredients/${ingredientId}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteBakeryIngredient = async (ingredientId) =>
  apiRequest(`/bakery/ingredients/${ingredientId}`, {
    method: "DELETE",
  });

export const updateBakeryIngredientStock = async (ingredientId, quantity) =>
  apiRequest(`/bakery/ingredients/${ingredientId}`, {
    method: "PATCH",
    body: { stock: quantity },
  });

export const getBakeryProducts = async () => apiRequest("/bakery/products");

export const createBakeryProduct = async (payload) =>
  apiRequest("/bakery/products", {
    method: "POST",
    body: payload,
  });

export const updateBakeryProduct = async (productId, payload) =>
  apiRequest(`/bakery/products/${productId}`, {
    method: "PATCH",
    body: payload,
  });

export const deleteBakeryProduct = async (productId) =>
  apiRequest(`/bakery/products/${productId}`, {
    method: "DELETE",
  });

export const getBakeryOrders = async (params = {}) => {
  const query = buildQueryString(params);
  return apiRequest(`/bakery/orders${query}`);
};

export const updateBakeryOrderStatus = async (orderId, payload) =>
  apiRequest(`/bakery/orders/${orderId}/status`, {
    method: "PATCH",
    body: payload,
  });

export const getBakeryAnalytics = async () => apiRequest("/bakery/analytics");

export const getBakeryReviews = async (bakeryId, params = {}) => {
  const query = buildQueryString({ bakeryId, ...params });
  return apiRequest(`/bakery/reviews${query}`);
};

export const createBakeryReview = async (payload) =>
  apiRequest("/bakery/reviews", {
    method: "POST",
    body: payload,
  });
