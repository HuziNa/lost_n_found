import React from "react";

export default function SubscribeSection() {
  return (
    <div className="subscribe-section">
      <h2 className="subscribe-title">News, Creations & Latest Events</h2>
      <p className="subscribe-sub">
        Subscribe to be the first to know about new arrivals and exclusive
        offers.
      </p>
      <div className="subscribe-form">
        <input
          className="subscribe-input"
          type="email"
          placeholder="Your email address"
        />
        <button className="subscribe-btn">Subscribe</button>
      </div>
    </div>
  );
}
