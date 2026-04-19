import React from "react";

export default function ServicesStrip() {
  return (
    <div className="strip">
      <div className="strip-inner">
        <div className="strip-item">
          <div className="strip-text">
            <div className="strip-title">Fast Delivery</div>
            <div className="strip-sub">Delivered to your door</div>
          </div>
        </div>
        <div className="strip-item">
          <div className="strip-text">
            <div className="strip-title">7AM – 3AM Daily</div>
            <div className="strip-sub">Late night cravings covered</div>
          </div>
        </div>
        <div className="strip-item">
          <div className="strip-text">
            <div className="strip-title">Gift Packaging</div>
            <div className="strip-sub">Special gifting collection</div>
          </div>
        </div>
        <div className="strip-item">
          <div className="strip-text">
            <div className="strip-title">Nationwide</div>
            <div className="strip-sub">Deliver anywhere in Pakistan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
