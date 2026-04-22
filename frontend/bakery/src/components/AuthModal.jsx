import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./customize/Icons";
import "../styles/auth.css";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, signup } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (authMode === "login") {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message);
      }
    } else {
      const result = await signup({
        name,
        email,
        password,
        contactNumber: phoneNumber,
        role: "customer",
      });
      if (result.success) {
        if (result.message) {
          setSuccessMsg(result.message);
        }
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay" onClick={closeAuthModal}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={closeAuthModal} aria-label="Close">
          <Icon name="close" size={14} />
        </button>
        
        <div className="auth-header">
          <h2 className="auth-title">
            {authMode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {authMode === "login" 
              ? "Sign in to continue your artisanal journey" 
              : "Join our community of baking enthusiasts"}
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${authMode === "login" ? "active" : ""}`}
            onClick={() => { setAuthMode("login"); setError(""); }}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
            onClick={() => { setAuthMode("signup"); setError(""); }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {authMode === "signup" && (
            <div className="auth-field">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Jean-Pierre" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="hello@artisan.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          {authMode === "signup" && (
            <div className="auth-field">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="+92 300 1234567" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="auth-field">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {successMsg && <div className="auth-success">{successMsg}</div>}

          <button className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Processing..." : (authMode === "login" ? "Sign In" : "Register")}
          </button>
        </form>

        <div className="auth-footer">
          {authMode === "login" ? (
            <p>Don't have an account? <span onClick={() => setAuthMode("signup")}>Sign up for free</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setAuthMode("login")}>Login here</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
