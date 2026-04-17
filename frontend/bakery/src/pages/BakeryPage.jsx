import React from "react";
import { useParams, Navigate } from "react-router-dom";
import CategoriesSection from "../components/CategoriesSection";
import CakeCollection from "../components/CakeCollection";
import AboutSection from "../components/AboutSection";
import ReviewsSection from "../components/ReviewsSection";
import { BAKERIES } from "../data/bakeries";

export default function BakeryPage() {
  const { id } = useParams();
  
  // If id is not specified, default to first bakery for demo purposes,
  // or handle invalid bakery IDs.
  const bakeryId = id ? parseInt(id, 10) : 1; 
  const bakery = BAKERIES.find(b => b.id === bakeryId) || BAKERIES[0];

  return (
    <div className="page active" id="page-bakery">
      
      {/* Bakery Header Section */}
      <section className="section bakery-hero" style={{ 
        backgroundImage: bakery.img ? `url(${bakery.img})` : `url(https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=1600&q=80)`,
        backgroundColor: bakery.fallbackBg || 'var(--sage-dark)',
      }}>
        <div className="bakery-hero-overlay"></div>
        <div className="section-inner bakery-hero-inner" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div className="hero-kicker" style={{ justifyContent: "center" }}>
            <div className="hero-kicker-line" style={{ background: "var(--gold)" }}></div>
            <div className="hero-kicker-text" style={{ color: "var(--gold)" }}>{bakery.category}</div>
            <div className="hero-kicker-line" style={{ background: "var(--gold)" }}></div>
          </div>
          <h1 className="hero-title" style={{ fontSize: "64px", marginBottom: "20px", color: "var(--cream)" }}>
            {bakery.name}
          </h1>
          <p className="hero-subtitle" style={{ color: "var(--cream)", maxWidth: "600px", margin: "0 auto", fontSize: "18px", opacity: 0.9 }}>
            {bakery.desc}
          </p>
          <div className="hero-meta" style={{ justifyContent: "center", marginTop: "40px", borderTopColor: "rgba(255,255,255,0.2)" }}>
            <div className="hero-meta-item">
              <div className="hero-meta-num" style={{ color: "var(--cream)" }}>{bakery.rating}★</div>
              <div className="hero-meta-label" style={{ color: "var(--gold)" }}>Rating</div>
            </div>
          </div>
        </div>
      </section>

      <CategoriesSection />
      <CakeCollection />
      <AboutSection />
      <ReviewsSection />
    </div>
  );
}
