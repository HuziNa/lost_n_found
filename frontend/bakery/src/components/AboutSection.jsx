import React from "react";

export default function AboutSection() {
  return (
    <div className="about-section">
      <div className="about-inner">
        <div className="about-img-col">
          <img
            src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop"
            alt="Baker crafting artisan pastries"
            onError={(e) => (e.target.style.background = "#2A1A10")}
          />
        </div>
        <div className="about-text-col">
          <div className="about-kicker">Our Story</div>
          <h2 className="about-title">
            Enter the World<br />of <em>SweetCraft</em>
          </h2>
          <p className="about-body">
            A culture, tradition, lifestyle, and class — with a legacy spanning
            over a century. Our bakery stands as a testament to generations of
            craft, passion, and the belief that food is love made edible.
          </p>
          <p className="about-body">
            Every product is a masterful symphony of flavors, expertly crafted
            to leave you spellbound. From Presidents to families, our creations
            have graced the finest tables.
          </p>
          <div className="about-quote">
            <p>
              "Making this world a better place by sharing love, empathy and
              happiness — one slice at a time."
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-box">
              <div className="stat-number">115+</div>
              <div className="stat-label">Years of Heritage</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">200+</div>
              <div className="stat-label">Unique Recipes</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Baked Fresh Daily</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
