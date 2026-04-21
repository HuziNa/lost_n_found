import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBakeryCategories, getBakeryMenuProducts } from "../api/bakery";
import { useAuth } from "../context/AuthContext";
import FeaturedCategories from "../components/FeaturedCategories";
import CakeCollection from "../components/CakeCollection";
import AboutSection from "../components/AboutSection";
import ReviewsSection from "../components/ReviewsSection";

export default function BakeryPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const fallbackId = import.meta.env.VITE_FEATURED_BAKERY_ID || null;
  const bakeryId = id || user?.bakeryManaged?.id || fallbackId;

  const menuQuery = useQuery({
    queryKey: ["bakeryMenu", bakeryId],
    queryFn: () => getBakeryMenuProducts(bakeryId),
    enabled: !!bakeryId,
  });

  const categoriesQuery = useQuery({
    queryKey: ["bakeryCategories", bakeryId],
    queryFn: () => getBakeryCategories(bakeryId),
    enabled: !!bakeryId,
  });

  const bakery = menuQuery.data?.bakery || null;
  const products = menuQuery.data?.products || [];
  const bakeryAddress = String(bakery?.address || "").trim();
  const fallbackHeroImage =
    "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=1600&q=80";
  const heroImageUrl = bakery?.imageUrl && bakery.imageUrl.trim()
    ? bakery.imageUrl.trim()
    : fallbackHeroImage;

  const [activeCategory, setActiveCategory] = useState("all");

  const productCategories = useMemo(() => {
    const unique = new Map();
    products.forEach((product) => {
      if (product.category?.name && product.category?.id) {
        unique.set(product.category.id, product.category);
      }
    });
    return Array.from(unique.values());
  }, [products]);

  const categoryData = categoriesQuery.data || {};
  const categories = categoryData.categories || productCategories;
  const featuredCategories = (categoryData.categories || []).filter(c => c.isFeatured);

  useEffect(() => {
    if (activeCategory === "all") return;
    const exists = categories.some((category) => category.name === activeCategory);
    if (!exists) {
      setActiveCategory("all");
    }
  }, [activeCategory, categories]);

  return (
    <div className="page active" id="page-bakery">
      {!bakeryId && (
        <div className="placeholder-box" style={{ marginTop: "140px" }}>
          No bakery selected. Please choose a bakery from the home page.
        </div>
      )}
      
      {/* Bakery Header Section */}
      <section className="section bakery-hero" style={{ 
        backgroundImage: `url(${heroImageUrl})`,
        backgroundColor: 'var(--sage-dark)',
      }}>
        <div className="bakery-hero-overlay"></div>
        <div className="section-inner bakery-hero-inner">
          <div className="hero-kicker center-kicker">
            <div className="hero-kicker-line gold-line"></div>
            <div className="hero-kicker-text gold-text">Bakery</div>
            <div className="hero-kicker-line gold-line"></div>
          </div>
          <h1 className="bakery-title-main">
            {bakery?.name || "Bakery"}
          </h1>
          <p className="bakery-subtitle-main">
            Browse our latest menu selections and seasonal favorites.
          </p>
          {bakeryAddress && (
            <p
              style={{
                color: "var(--cream)",
                marginTop: "12px",
                fontSize: "14px",
                letterSpacing: "0.4px",
                opacity: 0.9,
              }}
            >
              {bakeryAddress}
            </p>
          )}
          <div className="hero-meta center-meta">
            <div className="hero-meta-item">
              <div className="hero-meta-num cream-text">{products.length}</div>
              <div className="hero-meta-label gold-text">Menu Items</div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedCategories 
        categories={featuredCategories}
        onSelectCategory={(categoryName) => setActiveCategory(categoryName)}
      />
      {menuQuery.isLoading && <div className="placeholder-box">Loading menu...</div>}
      {menuQuery.isError && <div className="placeholder-box">Unable to load menu.</div>}
      {!menuQuery.isLoading && (
        <CakeCollection
          products={products}
          categories={categories}
          filter={activeCategory}
          onFilterChange={setActiveCategory}
        />
      )}
      <AboutSection
        story={bakery?.myStory}
        quote={bakery?.storyQuote}
        stats={{
          years: bakery?.statsYears,
          customers: bakery?.statsCustomers,
          recipes: bakery?.statsRecipes,
          baked: bakery?.statsBaked,
        }}
        bakeryName={bakery?.name}
        bakeryImageUrl={bakery?.imageUrl}
      />
      <ReviewsSection bakeryId={bakeryId} />
    </div>
  );
}
