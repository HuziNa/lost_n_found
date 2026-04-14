import React from "react";

export default function CategoriesSection() {
  const scrollToCakes = () => {
    const cakesElement = document.getElementById("cakes");
    if (cakesElement) cakesElement.scrollIntoView({ behavior: "smooth" });
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
          }}
        >
          <div>
            <div className="section-kicker">Our Offerings</div>
            <h2 className="section-title">
               Browse <em>Categories</em>
            </h2>
          </div>
        </div>
        <div className="cat-grid">
          {/* Cakes — large */}
          <div className="cat-card span-2" onClick={scrollToCakes}>
            <img
              src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=80&auto=format&fit=crop"
              alt="Luxury celebration cakes"
              onError={(e) => {
                e.target.style.background = "#C4847A";
                e.target.style.display = "flex";
                e.target.style.alignItems = "center";
                e.target.style.justifyContent = "center";
                e.target.textContent = "🎂";
              }}
            />
            <div className="cat-card-overlay"></div>
            <div className="cat-card-body">
              <div className="cat-card-tag">Signature</div>
              <div className="cat-card-name">
                Celebration<br />Cakes
              </div>
              <div className="cat-card-count">18 varieties</div>
            </div>
          </div>
          {/* Donuts */}
          <div className="cat-card">
            <img
              src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80&auto=format&fit=crop"
              alt="Artisan donuts"
              onError={(e) => (e.target.style.background = "#D4B46A")}
            />
            <div className="cat-card-overlay"></div>
            <div className="cat-card-body">
              <div className="cat-card-tag">Daily Baked</div>
              <div className="cat-card-name">Donuts</div>
              <div className="cat-card-count">8 flavors</div>
            </div>
          </div>
          {/* Gifting */}
          <div className="cat-card">
            <img
              src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=80&auto=format&fit=crop"
              alt="Luxury gifting boxes"
              onError={(e) => (e.target.style.background = "#A8C5AF")}
            />
            <div className="cat-card-overlay"></div>
            <div className="cat-card-body">
              <div className="cat-card-tag">Curated</div>
              <div className="cat-card-name">Gifting</div>
              <div className="cat-card-count">20+ sets</div>
            </div>
          </div>
          {/* Macarons */}
          <div className="cat-card">
            <img
              src="https://images.unsplash.com/photo-1571115176098-24ec42ed204d?w=600&q=80&auto=format&fit=crop"
              alt="Delicate French macarons"
              onError={(e) => (e.target.style.background = "#E8C4BF")}
            />
            <div className="cat-card-overlay"></div>
            <div className="cat-card-body">
              <div className="cat-card-tag">Artisan Crafted</div>
              <div className="cat-card-name">Macarons</div>
              <div className="cat-card-count">24 flavors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
