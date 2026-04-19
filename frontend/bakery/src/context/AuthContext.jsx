import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5001/api/auth";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "An error occurred during login." };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Some backends return token on signup, some don't. 
        // Based on the controller, it returns user but no token explicitly shown in my previous view_file (wait, let me check again)
        // I checked authController.js: login returns token, register returns user but NO token.
        // I should probably auto-login after signup if token is available, or just tell user to login.
        // Actually, many systems auto-login. I'll check registerUser again.
        
        // RE-CHECKING authController.js:
        // registerUser returns: res.status(201).json({ message: "Signup successful.", user: sanitizeUser(user), redirectTo: HERO_PAGE_PATH });
        // No token. So I'll just switch them to login mode or perform login automatically if I want.
        // Let's just switch to login mode with a success message for now, or I could modify backend? 
        // User asked for the popup, I'll stick to frontend changes first.
        
        return { success: true, message: "Signup successful! Please log in." };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "An error occurred during signup." };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
