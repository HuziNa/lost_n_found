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
      <section className="section" style={{ background: bakery.fallbackBg || 'var(--sage-light)', paddingTop: '100px', paddingBottom: '60px' }}>
        <div className="section-inner" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <div className="hero-kicker">
            <div className="hero-kicker-line" style={{ background: "var(--ink)"}}></div>
            <div className="hero-kicker-text">{bakery.category}</div>
          </div>
          <h1 className="hero-title" style={{ fontSize: "64px", marginBottom: "20px" }}>
            {bakery.name}
          </h1>
          <p className="hero-subtitle" style={{ color: "var(--ink)", maxWidth: "600px", margin: "0 auto", fontSize: "18px" }}>
            {bakery.desc}
          </p>
          <div className="hero-meta" style={{ justifyContent: "center", marginTop: "40px" }}>
            <div className="hero-meta-item">
              <div className="hero-meta-num">{bakery.rating}★</div>
              <div className="hero-meta-label">Rating</div>
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
