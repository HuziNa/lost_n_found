import React from "react";
import { getCategoryImage } from "../utils/categoryImages";

/**
 * FeaturedCategories Component
 * Displays categories marked as 'isFeatured' by the bakery owner.
 * These are highlighted collections like "Summer Bestsellers" or "Chef's Specials".
 */
export default function FeaturedCategories({ categories = [], onSelectCategory }) {
  if (categories.length === 0) return null;

  return (
    <section
      className="section featured-cat-section"
      style={{
        paddingBottom: "20px",
        background: "var(--warm-white)",
        borderTop: "1px solid var(--border-gold)",
      }}
    >
      <div className="section-inner">
        <div className="section-header" style={{ textAlign: "center", marginBottom: "32px" }}>
          <div className="section-kicker" style={{ justifyContent: "center" }}>Curated for You</div>
          <h2 className="section-title">Featured <em>Collections</em></h2>
        </div>
        
        <div className="featured-cat-grid">
          {categories.map((category) => {
            const imageUrl = getCategoryImage(category.id) || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80";
            
            return (
              <div 
                key={category.id} 
                className="featured-cat-card"
                onClick={() => onSelectCategory(category.name)}
              >
                <div className="featured-cat-img-wrap">
                  <img src={imageUrl} alt={category.name} />
                  <div className="featured-cat-overlay"></div>
                  <div className="featured-cat-content">
                    <span className="featured-badge">Featured</span>
                    <h3 className="featured-cat-name">{category.name}</h3>
                    <div className="featured-cat-btn">Explore Collection</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .featured-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .featured-cat-card {
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border-radius: 0;
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .featured-cat-card:hover {
          transform: translateY(-5px);
        }

        .featured-cat-img-wrap {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: var(--sage-light);
        }

        .featured-cat-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .featured-cat-card:hover .featured-cat-img-wrap img {
          transform: scale(1.05);
        }

        .featured-cat-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(28, 20, 16, 0.84) 0%, rgba(28, 20, 16, 0.18) 62%);
        }

        .featured-cat-content {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          color: var(--cream);
        }

        .featured-badge {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold-light);
          background: rgba(28, 20, 16, 0.45);
          border: 1px solid rgba(184, 151, 58, 0.55);
          padding: 4px 10px;
          border-radius: 999px;
          margin-bottom: 8px;
        }

        .featured-cat-name {
          font-family: var(--font-display);
          font-size: 28px;
          margin: 0 0 12px 0;
          font-weight: 500;
          color: var(--cream);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
        }

        .featured-cat-btn {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 4px;
          opacity: 0.8;
          color: var(--cream);
          transition: opacity 0.3s ease;
        }

        .featured-cat-card:hover .featured-cat-btn {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .featured-cat-grid {
            grid-template-columns: 1fr;
          }
          .featured-cat-name {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
}
