import { apiRequest } from "./client";

export const placeOrder = async (payload) =>
  apiRequest("/orders", {
    method: "POST",
    body: payload,
  });
