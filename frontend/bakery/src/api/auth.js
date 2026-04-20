import { apiRequest } from "./client";

export const loginUser = async (payload) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: payload,
  });

export const signupUser = async (payload) =>
  apiRequest("/auth/signup", {
    method: "POST",
    body: payload,
  });

export const logoutUser = async () =>
  apiRequest("/auth/logout", {
    method: "POST",
  });
