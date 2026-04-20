import React, { useMemo, useState } from "react";
import CakeCard from "./CakeCard";

export default function CakeCollection({ products = [], categories: categoriesProp = [], filter, onFilterChange }) {
  const [localFilter, setLocalFilter] = useState("all");
  const activeFilter = filter ?? localFilter;
  const setFilter = onFilterChange ?? setLocalFilter;

  const derivedCategories = useMemo(() => {
    const unique = new Map();
    products.forEach((product) => {
      if (product.category?.name) {
        unique.set(product.category.name, product.category);
      }
    });
    return Array.from(unique.values());
  }, [products]);

  const categories = categoriesProp.length > 0 ? categoriesProp : derivedCategories;

  const displayProducts =
    activeFilter === "all"
      ? products
      : products.filter((product) => product.category?.name === activeFilter);

  return (
    <section className="section cakes-section" id="cakes">
      <div className="section-inner">
        <div
          className="section-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: 0,
          }}
        >
          <div>
            <div className="section-kicker">Our Speciality</div>
            <h2 className="section-title">Explore the <em>Collection</em></h2>
          </div>
          <div className="cake-filters">
            <button
              className={`filter-btn ${activeFilter === "all" ? "selected" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id || category.name}
                className={`filter-btn ${activeFilter === category.name ? "selected" : ""}`}
                onClick={() => setFilter(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        <div className="cake-grid" style={{ marginTop: '40px' }}>
          {displayProducts.length === 0 && (
            <div className="placeholder-box">No products available yet.</div>
          )}
          {displayProducts.map(product => (
            <CakeCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
