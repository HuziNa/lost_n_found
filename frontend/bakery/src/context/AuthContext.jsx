import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, signupUser } from "../api/auth";
import { getMe } from "../api/users";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMe();
      setUser(response?.user || null);
    } catch (error) {
      if (error?.status !== 401) {
        console.error("Failed to refresh session:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      setUser(data.user || null);
      closeAuthModal();
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error?.data?.message || "An error occurred during login." };
    }
  };

  const signup = async (userData) => {
    try {
      const data = await signupUser(userData);
      if (data?.user) {
        setUser(data.user);
        closeAuthModal();
        return { success: true, message: data.message };
      }
      return { success: true, message: data?.message || "Signup successful." };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: error?.data?.message || "An error occurred during signup." };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
