import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      {/* Left panel — text content */}
      <div className="hero-left">
        <div className="hero-kicker">
          <div className="hero-kicker-line" />
          <span className="hero-kicker-text">Exquisite Flavors</span>
        </div>

        <h1 className="hero-title">
          <span style={{ color: 'var(--ink)' }}>The Essence of</span> <br />
          <span style={{ color: 'var(--sage-dark)', fontStyle: 'italic' }}>Parisian</span>{' '}
          <span style={{ color: 'var(--rose-dark)', fontStyle: 'italic' }}>Luxury</span>
        </h1>
        
        <p className="hero-subtitle">
          Discover a curated selection of the finest artisanal bakeries. From delicate macarons to bespoke tiered creations, experience the pinnacle of luxury.
        </p>

        <div className="hero-actions">
          <button 
            className="btn-primary" 
            onClick={() => {
              const bakeriesElement = document.getElementById("bakeries-grid");
              if (bakeriesElement) bakeriesElement.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Discover
          </button>
          <button
            className="btn-sage"
            onClick={() => navigate("/register-bakery")}
          >
            Register Your Bakery
          </button>
        </div>

        <div className="hero-meta">
          <div className="hero-meta-item">
            <div className="hero-meta-num">45+</div>
            <div className="hero-meta-label">Artisan Partners</div>
          </div>
          <div className="hero-meta-item">
            <div className="hero-meta-num">12k</div>
            <div className="hero-meta-label">Happy Clients</div>
          </div>
        </div>
      </div>

      {/* Right panel — image collage area */}
      <div className="hero-right">
        <div className="hero-img-main">
          <img
            src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80&auto=format&fit=crop"
            alt="Artisanal luxury cakes"
          />
          <div className="hero-img-overlay" />
        </div>

        {/* Floating elements to add depth */}
        <div className="hero-float-card hero-float-1">
          <div className="float-label">RATED EXCELLENT</div>
          <div className="float-value">4.9/5</div>
          <div className="float-stars">★★★★★</div>
        </div>

        <div className="hero-float-card hero-float-2">
          <div className="float-label">NEXT DELIVERY</div>
          <div className="float-value">Today</div>
          <div className="float-sub">Limited slots available</div>
        </div>
      </div>
    </section>
  );
}
