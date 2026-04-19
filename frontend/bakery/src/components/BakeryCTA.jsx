import React from "react";
import { useNavigate } from "react-router-dom";

export default function BakeryCTA() {
  const navigate = useNavigate();

  return (
    <section className="bakery-cta">
      <div className="bakery-cta-inner">
        <div className="bakery-cta-content">
          <div className="bakery-cta-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="bakery-cta-title">Own a Bakery?</h2>
          <h3 className="bakery-cta-heading">Sell Your Baked Goods Online</h3>
          <p className="bakery-cta-text">
            Reach more customers, manage orders effortlessly, and grow your business with our premium marketplace. Join our curated community of artisan partners.
          </p>
          <button className="btn-primary" onClick={() => navigate("/register-bakery")}>
            Register Your Bakery
          </button>
        </div>
      </div>
    </section>
  );
}
