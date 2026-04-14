import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function CakeCard({ cake }) {
  const navigate = useNavigate();
  const { quickAdd } = useApp();
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
        <div className="cake-card-footer">
          <div className="cake-price">Rs {cake.price.toLocaleString()}</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn-add"
              onClick={() => quickAdd(cake.name, cake.price)}
            >
              + Add
            </button>
            <button
              className="btn-customize"
              onClick={() => navigate("/customize")}
            >
              Customize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
