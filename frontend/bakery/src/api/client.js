const RAW_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const API_BASE_URL = RAW_BASE_URL.endsWith("/")
  ? RAW_BASE_URL.slice(0, -1)
  : RAW_BASE_URL;

const buildUrl = (path) => {
  if (!path) {
    return API_BASE_URL;
  }

  if (path.startsWith("http")) {
    return path;
  }

  return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
};

const normalizeError = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return { message: text };
};

export const apiRequest = async (path, options = {}) => {
  const config = { ...options };
  config.credentials = "include";

  const headers = { ...(config.headers || {}) };
  if (config.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  config.headers = headers;

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(buildUrl(path), config);
  if (!response.ok) {
    const errorPayload = await normalizeError(response);
    const error = new Error(errorPayload?.message || "Request failed.");
    error.status = response.status;
    error.data = errorPayload;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
};

export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.append(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};
