import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PizzaCard({ pizza }) {
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
          src={pizza.img}
          alt={pizza.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            setImgError(true);
            e.target.style.display = "none";
          }}
        />
        {pizza.badge && (
          <div className={`cake-badge ${pizza.badge}`}>
            {pizza.badge}
          </div>
        )}
      </div>
      <div className="cake-card-body">
        <h3 className="cake-card-name">{pizza.name}</h3>
        <p className="cake-card-desc">{pizza.desc}</p>
        <div className="cake-card-footer" style={{ borderTop: 'none', paddingTop: 0, flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
          <div className="cake-price" style={{ marginBottom: '4px' }}>Rs {pizza.price.toLocaleString()}</div>
          <button
            className="btn-primary"
            onClick={() => navigate(`/product/${pizza.id}?type=pizza`)}
            style={{ width: '100%' }}
          >
            Customize Pizza
          </button>
        </div>
      </div>
    </div>
  );
}