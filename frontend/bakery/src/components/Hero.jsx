import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-kicker">
          <div className="hero-kicker-line"></div>
          <div className="hero-kicker-text">Est. Since 1910 — A Baking Legacy</div>
        </div>
        <h1 className="hero-title">
          Baked with<br />
          <em>Love &</em><br />
          <span className="hero-title-script">Tradition</span>
        </h1>
        <p className="hero-subtitle">
          Crafted from the finest ingredients, every cake tells a story. From
          delicate fresh cream to indulgent mousse — experience the art of
          baking, elevated.
        </p>
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => {
              const cakesElement = document.getElementById("cakes");
              if (cakesElement) cakesElement.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Collection
          </button>
          <button className="btn-outline" onClick={() => navigate("/customize")}>
            Build Your Cake
          </button>
        </div>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <div className="hero-meta-num">115+</div>
            <div className="hero-meta-label">Years of Heritage</div>
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
          <div className="float-label">Customer Rating</div>
          <div className="float-value">4.9</div>
          <div className="float-stars">★★★★★</div>
          <div className="float-sub">50,000+ reviews</div>
        </div>
        <div className="hero-float-card hero-float-2">
          <div className="float-label">A Baking Legacy</div>
          <div className="float-value">115</div>
          <div className="float-sub">Years of Craftsmanship</div>
        </div>
      </div>
    </section>
  );
}
