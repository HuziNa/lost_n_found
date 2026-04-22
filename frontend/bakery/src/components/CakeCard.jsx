import React from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&q=80&auto=format&fit=crop";

export default function CakeCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="cake-card">
      <div 
        className="cake-card-img" 
        style={{ 
          backgroundColor: '#eee',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="cake-card-body">
        <h3 className="cake-card-name">{product.name}</h3>
        <p className="cake-card-desc">{product.category?.name || "Signature item"}</p>
        <div className="cake-card-footer" style={{ borderTop: 'none', paddingTop: 0, flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
          <div className="cake-price" style={{ marginBottom: '4px' }}>
            Rs {Number(product.basePrice || 0).toLocaleString()}
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ width: '100%' }}
          >
            Explore Creation
          </button>
        </div>
      </div>
    </div>
  );
}
