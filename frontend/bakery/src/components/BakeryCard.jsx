import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BakeryCard({ bakery }) {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [imgError, setImgError] = useState(!bakery.imageUrl);

  const isOrderable = bakery.isActive !== false;

  const handleClick = () => {
    if (!isOrderable) {
      return;
    }
    if (!user) {
      openAuthModal("login");
    } else {
      navigate(`/bakery/${bakery.id}`);
    }
  };

  return (
    <div
      className="bakery-card"
      onClick={handleClick}
      style={{ cursor: isOrderable ? "pointer" : "default" }}
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
        {!imgError && bakery.imageUrl ? (
          <img
            src={bakery.imageUrl}
            alt={bakery.name}
            className="bakery-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : null}
      </div>
      <div className="bakery-content">
        <div className="bakery-badge">{isOrderable ? "Open" : "Inactive"}</div>
        <h3 className="bakery-name">{bakery.name}</h3>
        <p className="bakery-category">{bakery.address || "City center"}</p>
        <p className="bakery-desc">
          {bakery.orderStats
            ? `${bakery.orderStats.totalOrders} orders - Rs ${Number(bakery.orderStats.totalRevenue || 0).toLocaleString()} revenue`
            : "Freshly baked items delivered daily."}
        </p>
        <div className="bakery-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button 
            className="btn-primary"
            style={{ width: '100%', marginTop: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {isOrderable ? "Order" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
