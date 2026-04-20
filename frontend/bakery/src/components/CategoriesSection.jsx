import React from "react";
import { getCategoryImage } from "../utils/categoryImages";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571115176098-24ec42ed204d?w=600&q=80&auto=format&fit=crop",
];

const CATEGORY_IMAGES = {
  cake: "https://tse4.mm.bing.net/th/id/OIP.jggcJPFc0lMi3dzd5VYzqwHaHQ?rs=1&pid=ImgDetMain&o=7&rm=3",
  cupcake: "https://tse4.mm.bing.net/th/id/OIP.ojy9M0h34CANEtz42j-miAHaIu?w=736&h=867&rs=1&pid=ImgDetMain&o=7&rm=3",
  pizza: "https://tse3.mm.bing.net/th/id/OIP.6o-iCWIBMb3VTDt-fh5OMQHaE7?w=626&h=417&rs=1&pid=ImgDetMain&o=7&rm=3",
  bread: "https://i.pinimg.com/736x/67/76/af/6776af11592ca546a51ce7c2694df4ed.jpg",
};

export default function CategoriesSection({ categories = [], onSelectCategory }) {
  const scrollToCakes = () => {
    const cakesElement = document.getElementById("cakes");
    if (cakesElement) cakesElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategoryClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category.name);
    }
    scrollToCakes();
  };

  return (
    <section className="section cat-section">
      <div className="section-inner">
        <div
          className="section-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "40px"
          }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <div className="section-kicker" style={{ justifyContent: "center" }}>Our Offerings</div>
            <h2 className="section-title">
               Browse <em>Collections</em>
            </h2>
          </div>
        </div>
        <div className="cat-grid">
          {categories.length === 0 && (
            <div className="placeholder-box" style={{ gridColumn: "1 / -1" }}>
              No categories available yet.
            </div>
          )}
          {categories.map((category, index) => {
            const nameKey = (category.name || "").toLowerCase();
            const imageUrl =
              getCategoryImage(category.id) ||
              CATEGORY_IMAGES[nameKey] ||
              FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
            return (
              <div
                key={category.id || category.name}
                className="cat-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="cat-card-img-wrap">
                  <img
                    src={imageUrl}
                    alt={category.name}
                    onError={(event) => {
                      event.target.style.background = "#C4847A";
                    }}
                  />
                </div>
                <div className="cat-card-body">
                  <div className="cat-card-name">{category.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
