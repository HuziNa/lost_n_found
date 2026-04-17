import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CakeCard({ cake }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="cake-card">
      <div 
        className="cake-card-img" 
        style={{ 
          backgroundColor: imgError ? '#eee' : 'transparent',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img
          src={cake.img}
          alt={cake.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            setImgError(true);
            e.target.style.display = "none";
          }}
        />
        {cake.badge && (
          <div className={`cake-badge ${cake.badge}`}>
            {cake.badge}
          </div>
        )}
      </div>
      <div className="cake-card-body">
        <h3 className="cake-card-name">{cake.name}</h3>
        <p className="cake-card-desc">{cake.desc}</p>
        <div className="cake-card-footer" style={{ borderTop: 'none', paddingTop: 0, flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
          <div className="cake-price" style={{ marginBottom: '4px' }}>Rs {cake.price.toLocaleString()}</div>
          <button
            className="btn-primary"
            onClick={() => navigate(`/product/${cake.id}`)}
            style={{ width: '100%' }}
          >
            Explore Creation
          </button>
        </div>
      </div>
    </div>
  );
}
