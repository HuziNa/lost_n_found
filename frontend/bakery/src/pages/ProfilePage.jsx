import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMe, updateMe } from "../api/users";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    address: "",
    contactNumber: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const profileQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!user,
  });

  useEffect(() => {
    if (profileQuery.data?.user) {
      const profile = profileQuery.data.user;
      setFormState((prev) => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        address: profile.address || "",
        contactNumber: profile.contactNumber || "",
        password: "",
      }));
    }
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateMe(payload),
    onSuccess: (data) => {
      setMessage(data?.message || "Profile updated.");
      setError("");
      refreshUser();
    },
    onError: (err) => {
      setError(err?.data?.message || "Unable to update profile.");
      setMessage("");
    },
  });

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      name: formState.name,
      email: formState.email,
      address: formState.address,
      contactNumber: formState.contactNumber,
    };

    if (formState.password) {
      payload.password = formState.password;
    }

    updateMutation.mutate(payload);
  };

  return (
    <div className="page active" style={{ padding: "120px 20px" }}>
      <div className="auth-modal" style={{ maxWidth: "520px", margin: "0 auto" }}>
        <h2>My Profile</h2>
        {profileQuery.isLoading && <div className="placeholder-box">Loading profile...</div>}
        {profileQuery.isError && <div className="placeholder-box">Unable to load profile.</div>}
        {!profileQuery.isLoading && (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full Name</label>
              <input name="name" value={formState.name} onChange={handleChange} required />
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input name="email" type="email" value={formState.email} onChange={handleChange} required />
            </div>
            <div className="auth-field">
              <label>Contact Number</label>
              <input name="contactNumber" value={formState.contactNumber} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label>Address</label>
              <input name="address" value={formState.address} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label>New Password</label>
              <input name="password" type="password" value={formState.password} onChange={handleChange} />
            </div>
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            <button className="btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Update Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
