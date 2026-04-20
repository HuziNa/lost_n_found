import React from "react";

const DEFAULT_QUOTE =
  "Making this world a better place by sharing love, empathy and happiness — one slice at a time.";

const DEFAULT_STATS = {
  years: "115+",
  customers: "50K+",
  recipes: "200+",
  baked: "24/7",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop";

export default function AboutSection({ story, quote, stats, bakeryName, bakeryImageUrl }) {
  const hasStory = Boolean(story && story.trim());
  const displayQuote = quote && quote.trim() ? quote.trim() : DEFAULT_QUOTE;
  const displayBakeryName = bakeryName && bakeryName.trim() ? bakeryName.trim() : "SweetCraft";
  const displayImageUrl = bakeryImageUrl && bakeryImageUrl.trim()
    ? bakeryImageUrl.trim()
    : DEFAULT_IMAGE;
  const displayStats = {
    years: stats?.years && stats.years.trim() ? stats.years.trim() : DEFAULT_STATS.years,
    customers:
      stats?.customers && stats.customers.trim()
        ? stats.customers.trim()
        : DEFAULT_STATS.customers,
    recipes: stats?.recipes && stats.recipes.trim() ? stats.recipes.trim() : DEFAULT_STATS.recipes,
    baked: stats?.baked && stats.baked.trim() ? stats.baked.trim() : DEFAULT_STATS.baked,
  };

  return (
    <div className="about-section">
      <div className="about-inner">
        <div className="about-img-col">
          <img
            src={displayImageUrl}
            alt={`About ${displayBakeryName}`}
            onError={(event) => {
              event.target.src = DEFAULT_IMAGE;
              event.target.style.background = "#2A1A10";
            }}
          />
        </div>
        <div className="about-text-col">
          <div className="about-kicker">Our Story</div>
          <h2 className="about-title">
            Enter the World<br />of <em>{displayBakeryName}</em>
          </h2>
          {hasStory ? (
            <p className="about-body">{story}</p>
          ) : (
            <>
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
            </>
          )}
          <div className="about-quote">
            <p>
              "{displayQuote}"
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-box">
              <div className="stat-number">{displayStats.years}</div>
              <div className="stat-label">Years of Heritage</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{displayStats.customers}</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{displayStats.recipes}</div>
              <div className="stat-label">Unique Recipes</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{displayStats.baked}</div>
              <div className="stat-label">Baked Fresh Daily</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
