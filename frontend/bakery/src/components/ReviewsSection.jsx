import React, { useState } from "react";
import { REVIEWS_DATA, AVATAR_COLORS, AVATAR_TEXT } from "../data/reviews";
import { Icon } from "./ui/Icons";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(REVIEWS_DATA);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [text, setText] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    const nName = name.trim();
    const nProd = product.trim() || "SweetCraft Cake";
    const nText = text.trim();

    if (!nName || !nText || userRating === 0) {
      alert("Please fill your name, rating, and review text.");
      return;
    }

    const initials = nName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    const newReview = {
      name: nName,
      initials,
      product: nProd,
      rating: userRating,
      date: "Just now",
      text: nText,
      helpful: 0,
      color: reviews.length % 6,
    };

    setReviews([newReview, ...reviews]);
    setSuccess(true);
    setName("");
    setProduct("");
    setText("");
    setUserRating(0);

    setTimeout(() => setSuccess(false), 3000);
  };

  const handleHelpful = (index) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], helpful: newReviews[index].helpful + 1, _voted: true };
    setReviews(newReviews);
  };

  return (
    <section className="section reviews-section">
      <div className="section-inner">
        <div
          className="section-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div>
            <div className="section-kicker">Testimonials</div>
            <h2 className="section-title">Loved by <em>Thousands</em></h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "48px",
                fontWeight: 300,
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              4.9
            </div>
            <div style={{ color: "var(--gold)", fontSize: "18px", letterSpacing: "3px" }}>
              ★★★★★
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--ink-muted)",
                marginTop: "4px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Based on 2,400+ reviews
            </div>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="review-header">
                <div
                  className="review-avatar"
                  style={{
                    background: AVATAR_COLORS[r.color],
                    color: AVATAR_TEXT[r.color],
                  }}
                >
                  {r.initials}
                </div>
                <div className="review-meta">
                  <div className="review-name">{r.name}</div>
                  <div className="review-product">{r.product}</div>
                  <div className="review-stars">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                </div>
                <div className="review-date">{r.date}</div>
              </div>
              <div className="review-text">{r.text}</div>
              <div className="review-helpful">
                <span>Helpful?</span>
                <button 
                  onClick={() => handleHelpful(i)}
                  disabled={r._voted}
                >
                  <Icon name="thumbUp" size={12} />
                  {r.helpful}
                </button>
                <button disabled={r._voted} aria-label="Not helpful">
                  <Icon name="thumbDown" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Write review */}
        <div className="write-review">
          <div className="write-review-title">Share Your Experience</div>
          <div className="write-review-sub">
            Ordered from us? We'd love to hear what you think.
          </div>
          <div className="form-grid">
            <input
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="form-input"
              placeholder="Product ordered (e.g. Red Velvet)"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>
          <div className="star-label">Your Rating</div>
          <div className="star-picker" onMouseLeave={() => setHoveredStar(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="star-pick"
                onClick={() => setUserRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                style={{
                  color: star <= (hoveredStar || userRating) ? (hoveredStar && star <= hoveredStar ? "#D4B46A" : "#B8973A") : "#D3B89A",
                  cursor: "pointer",
                  transition: "0.15s",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Tell us about your experience — the taste, the presentation, the delivery..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          <button className="btn-primary" style={{ marginTop: "16px" }} onClick={handleSubmit}>
            Submit Review
          </button>
          
          {success && (
            <div
              style={{
                marginTop: "12px",
                color: "var(--sage-dark)",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Icon name="check" size={14} />
              Thank you! Your review has been posted.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
