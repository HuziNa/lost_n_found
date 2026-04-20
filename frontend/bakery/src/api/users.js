import { apiRequest, buildQueryString } from "./client";

export const getMe = async () => apiRequest("/users/me");

export const updateMe = async (payload) =>
  apiRequest("/users/me", {
    method: "PATCH",
    body: payload,
  });

export const getMyOrders = async (params = {}) => {
  const query = buildQueryString(params);
  return apiRequest(`/users/me/orders${query}`);
};
