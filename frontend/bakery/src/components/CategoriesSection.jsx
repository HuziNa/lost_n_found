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
          {/* Cakes */}
          <div className="cat-card" onClick={scrollToCakes}>
            <div className="cat-card-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80&auto=format&fit=crop"
                alt="Luxury celebration cakes"
                onError={(e) => { e.target.style.background = "#C4847A"; }}
              />
            </div>
            <div className="cat-card-body">
              <div className="cat-card-name">Celebration Cakes</div>
            </div>
          </div>
          {/* Donuts */}
          <div className="cat-card">
            <div className="cat-card-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80&auto=format&fit=crop"
                alt="Artisan donuts"
                onError={(e) => (e.target.style.background = "#D4B46A")}
              />
            </div>
            <div className="cat-card-body">
              <div className="cat-card-name">Daily Pastries</div>
            </div>
          </div>
          {/* Gifting */}
          <div className="cat-card">
            <div className="cat-card-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&q=80&auto=format&fit=crop"
                alt="Luxury gifting boxes"
                onError={(e) => (e.target.style.background = "#A8C5AF")}
              />
            </div>
            <div className="cat-card-body">
              <div className="cat-card-name">Gifting Sets</div>
            </div>
          </div>
          {/* Macarons */}
          <div className="cat-card">
            <div className="cat-card-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1571115176098-24ec42ed204d?w=600&q=80&auto=format&fit=crop"
                alt="Delicate French macarons"
                onError={(e) => (e.target.style.background = "#E8C4BF")}
              />
            </div>
            <div className="cat-card-body">
              <div className="cat-card-name">Artisan Macarons</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
