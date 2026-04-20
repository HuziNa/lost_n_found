import { apiRequest, buildQueryString } from "./client";

export const getAdminBakeries = async (params = {}) => {
  const query = buildQueryString(params);
  return apiRequest(`/admin/bakeries${query}`);
};

export const getTopOrdersBakery = async () => apiRequest("/admin/bakeries/top-orders");

export const getTopRevenueBakery = async () => apiRequest("/admin/bakeries/top-revenue");

export const updateBakeryApproval = async (bakeryId, status) =>
  apiRequest(`/admin/bakeries/${bakeryId}/approval`, {
    method: "PATCH",
    body: { status },
  });
