import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * A wrapper component that protects routes based on authentication and roles.
 * @param {string[]} allowedRoles - Roles allowed to access this route.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Authenticating...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn("Unauthorized access attempt by:", user.email, "Role:", user.role);
    return <Navigate to="/" replace />;
  }

  return children;
}
