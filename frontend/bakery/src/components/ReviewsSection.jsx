import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBakeryReview, getBakeryReviews } from "../api/bakery";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./customize/Icons";

const AVATAR_COLORS = ["#E8C4BF", "#C8DFF0", "#B8D8B9", "#D4B8E0", "#F5CBA7", "#C4847A"];
const AVATAR_TEXT = ["#9B5A52", "#185FA5", "#3B6D11", "#7B3A6B", "#854F0B", "#FAF6EF"];

const buildInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

export default function ReviewsSection({ bakeryId }) {
  const queryClient = useQueryClient();
  const { user, openAuthModal } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [text, setText] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["bakeryReviews", bakeryId],
    queryFn: () => getBakeryReviews(bakeryId),
    enabled: !!bakeryId,
  });

  const reviews = reviewsQuery.data?.reviews || [];

  const averageRating = reviewsQuery.data?.averageRating || 0;

  const reviewMutation = useMutation({
    mutationFn: (payload) => createBakeryReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryReviews", bakeryId], exact: true });
      setSuccess(true);
      setSubmitError("");
      setText("");
      setUserRating(0);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      setSubmitError(error?.data?.message || "Unable to submit review.");
      setSuccess(false);
    },
  });

  const canReview = user && user.role === "customer";
  const reviewNotice = user
    ? "Only customers can submit reviews."
    : "Log in as a customer to share your experience.";

  const handleSubmit = () => {
    if (!bakeryId) {
      return;
    }

    setSubmitError("");

    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!canReview) {
      alert("Only customers can submit reviews.");
      return;
    }

    const nText = text.trim();
    if (!nText || userRating === 0) {
      alert("Please provide a rating and your review.");
      return;
    }

    reviewMutation.mutate({
      bakeryId,
      rating: userRating,
      comment: nText,
    });
  };

  const parsedReviews = useMemo(
    () =>
      reviews.map((review, index) => {
        const name = review.customer?.name || "Guest";
        const initials = buildInitials(name);
        return {
          id: review.id,
          name,
          initials,
          rating: review.rating,
          date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "",
          text: review.comment,
          color: index % AVATAR_COLORS.length,
        };
      }),
    [reviews]
  );

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
              {averageRating.toFixed(1)}
            </div>
            <div style={{ color: "var(--gold)", fontSize: "18px", letterSpacing: "3px" }}>
              {"★".repeat(Math.round(averageRating || 0)).padEnd(5, "☆")}
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
              Based on {reviewsQuery.data?.totalReviews || 0} reviews
            </div>
          </div>
        </div>

        <div className="reviews-grid">
          {reviewsQuery.isLoading && <div className="placeholder-box">Loading reviews...</div>}
          {reviewsQuery.isError && (
            <div className="placeholder-box">
              Unable to load reviews.
            </div>
          )}
          {!reviewsQuery.isLoading && parsedReviews.length === 0 && (
            <div className="placeholder-box">No reviews yet.</div>
          )}
          {parsedReviews.map((r, i) => (
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
                <button disabled aria-label="Helpful">
                  <Icon name="thumbUp" size={12} />
                </button>
                <button disabled aria-label="Not helpful">
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
            {canReview
              ? "Ordered from us? We'd love to hear what you think."
              : reviewNotice}
          </div>
          {canReview ? (
            <>
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
              <button
                className="btn-primary"
                style={{ marginTop: "16px" }}
                onClick={handleSubmit}
                disabled={reviewMutation.isPending || !bakeryId}
              >
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
            </>
          ) : (
            !user && (
              <button
                className="btn-primary"
                style={{ marginTop: "16px" }}
                onClick={() => openAuthModal("login")}
              >
                Login to Review
              </button>
            )
          )}

          {submitError && (
            <div className="auth-error" style={{ marginTop: "12px" }}>
              {submitError}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
