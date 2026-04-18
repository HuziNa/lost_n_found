import React from "react";

export default function SubscribeSection() {
  return (
    <section className="subscribe-section">
      <div className="subscribe-inner">
        <div className="subscribe-copy">
          <h2 className="subscribe-title">News, Creations & Latest Events</h2>
          <p className="subscribe-sub">
            Subscribe to be the first to know about new arrivals and exclusive offers.
          </p>
        </div>
        <div className="subscribe-form">
          <input
            className="subscribe-input"
            type="email"
            placeholder="Your email address"
            aria-label="Email address"
          />
          <button className="subscribe-btn">Get Updates</button>
        </div>
      </div>
    </section>
  );
}
