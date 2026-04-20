import React from "react";
import { useParams } from "react-router-dom";
import CategoriesSection from "../components/CategoriesSection";
import CakeCollection from "../components/CakeCollection";
import PizzaCollection from "../components/PizzaCollection";
import AboutSection from "../components/AboutSection";
import ReviewsSection from "../components/ReviewsSection";
import { BAKERIES } from "../data/bakeries";

export default function BakeryPage() {
  const { id } = useParams();
  
  const bakeryId = id ? parseInt(id, 10) : 1; 
  const baseBakery = BAKERIES.find(b => b.id === bakeryId) || BAKERIES[0];
  let storedProfile = null;
  try {
    const raw = localStorage.getItem(`bakeryProfile_${bakeryId}`);
    storedProfile = raw ? JSON.parse(raw) : null;
  } catch (error) {
    storedProfile = null;
  }
  const bakery = { ...baseBakery, ...(storedProfile || {}) };

  return (
    <div className="page active" id="page-bakery">
      
      {/* Bakery Header Section */}
      <section className="section bakery-hero" style={{ 
        backgroundImage: bakery.img ? `url(${bakery.img})` : `url(https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=1600&q=80)`,
        backgroundColor: bakery.fallbackBg || 'var(--sage-dark)',
      }}>
        <div className="bakery-hero-overlay"></div>
        <div className="section-inner bakery-hero-inner">
          <div className="hero-kicker center-kicker">
            <div className="hero-kicker-line gold-line"></div>
            <div className="hero-kicker-text gold-text">{bakery.category}</div>
            <div className="hero-kicker-line gold-line"></div>
          </div>
          <h1 className="bakery-title-main">
            {bakery.name}
          </h1>
          <p className="bakery-subtitle-main">
            {bakery.desc}
          </p>
          <div className="hero-meta center-meta">
            <div className="hero-meta-item">
              <div className="hero-meta-num cream-text">{bakery.rating}★</div>
              <div className="hero-meta-label gold-text">Rating</div>
            </div>
            {bakery.address && (
              <div className="hero-meta-item">
                <div className="hero-meta-text cream-text">{bakery.address}</div>
                <div className="hero-meta-label gold-text">Address</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CategoriesSection />
      {bakery.category?.toLowerCase().includes("pizzeria") ? <PizzaCollection /> : <CakeCollection />}
      <AboutSection />
      <ReviewsSection />
    </div>
  );
}
