import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-kicker">
          <div className="hero-kicker-line"></div>
          <div className="hero-kicker-text">The Premier Baking Platform</div>
        </div>
        <h1 className="hero-title">
          Discover<br />
          <em>Artisan</em><br />
          <span className="hero-title-script">Bakeries</span>
        </h1>
        <p className="hero-subtitle">
          Curated selection of the finest patisseries in your city.
          Every bakery tells a story, and every pastry is an experience.
        </p>
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => {
              const cakesElement = document.getElementById("bakeries-grid");
              if (cakesElement) cakesElement.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Discover Bakeries
          </button>
          <button className="btn-outline" onClick={() => navigate("/customize")}>
            Bespoke Cake
          </button>
        </div>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <div className="hero-meta-num">15+</div>
            <div className="hero-meta-label">Premium Partners</div>
          </div>
          <div className="hero-meta-item">
            <div className="hero-meta-num">50K+</div>
            <div className="hero-meta-label">Happy Customers</div>
          </div>
          <div className="hero-meta-item">
            <div className="hero-meta-num">4.9★</div>
            <div className="hero-meta-label">Average Rating</div>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-img-main">
          <img
            src="https://images.unsplash.com/photo-1557308536-ee471ef2c390?w=900&q=85&auto=format&fit=crop"
            alt="Elegant layered cake with fresh roses and berries"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.style.background = "#E8D5C0";
            }}
          />
        </div>
        <div className="hero-img-overlay"></div>

        <div className="hero-float-card hero-float-1">
          <div className="float-label">Global Rating</div>
          <div className="float-value">4.9</div>
          <div className="float-stars">★★★★★</div>
          <div className="float-sub">Platform Wide</div>
        </div>
        <div className="hero-float-card hero-float-2">
          <div className="float-label">Premium Service</div>
          <div className="float-value">Fast</div>
          <div className="float-sub">Reliable Delivery</div>
        </div>
      </div>
    </section>
  );
}
