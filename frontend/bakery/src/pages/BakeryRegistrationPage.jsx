import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/auth";

export default function BakeryRegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bakeryName: "",
    bakeryAddress: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await signupUser({
        name: formData.ownerName,
        email: formData.email,
        password: formData.password,
        role: "owner",
        contactNumber: formData.phone,
        address: formData.bakeryAddress,
        bakeryName: formData.bakeryName,
        bakeryAddress: formData.bakeryAddress,
      });

      setSuccess(response?.message || "Registration submitted successfully.");
      setTimeout(() => navigate("/"), 1400);
    } catch (err) {
      setError(err?.data?.message || "Unable to submit registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <header className="registration-header">
          <h1 className="registration-title">Join Our Platform</h1>
          <p className="registration-subtitle">
            Partner with the finest luxury marketplace and share your artisan creations with a wider audience.
          </p>
        </header>

        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bakeryName">Bakery Name</label>
              <input
                type="text"
                id="bakeryName"
                name="bakeryName"
                value={formData.bakeryName}
                onChange={handleChange}
                placeholder="e.g. Maison de Pâtisserie"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="bakeryAddress">Bakery Address</label>
              <input
                type="text"
                id="bakeryAddress"
                name="bakeryAddress"
                value={formData.bakeryAddress}
                onChange={handleChange}
                placeholder="123 Artisan Way"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ownerName">Owner Name</label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Account Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="03xxxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">About Your Bakery</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your specialties, experience, and what makes your bakery unique..."
              rows="5"
              required
            ></textarea>
          </div>

          <div className="registration-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/")}>
              Cancel
            </button>
          </div>

          {error && <div className="auth-error" style={{ marginTop: "12px" }}>{error}</div>}
          {success && <div className="auth-success" style={{ marginTop: "12px" }}>{success}</div>}
        </form>
      </div>
    </div>
  );
}
