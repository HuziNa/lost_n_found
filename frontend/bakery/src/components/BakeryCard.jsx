import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BakeryCard({ bakery }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(!bakery.img);

  const handleClick = () => {
    if (bakery.action === "Order") {
      navigate(`/bakery/${bakery.id}`);
    }
  };

  return (
    <div
      className="bakery-card"
      onClick={handleClick}
      style={{ cursor: bakery.action === "Order" ? "pointer" : "default" }}
    >
      <div 
        className="bakery-image-container" 
        style={{ 
          height: '240px', 
          backgroundColor: imgError ? bakery.fallbackBg || '#eee' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {!imgError && bakery.img ? (
          <img
            src={bakery.img}
            alt={bakery.name}
            className="bakery-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : null}
      </div>
      <div className="bakery-content">
        <div className="bakery-badge">{bakery.badge}</div>
        <h3 className="bakery-name">{bakery.name}</h3>
        <p className="bakery-category">{bakery.category}</p>
        <p className="bakery-desc">{bakery.desc}</p>
        <div className="bakery-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button 
            className="btn-primary"
            style={{ width: '100%', marginTop: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {bakery.action}
          </button>
        </div>
      </div>
    </div>
  );
}
