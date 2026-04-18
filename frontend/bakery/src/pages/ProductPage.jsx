import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CAKES } from "../data/cakes";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import '../styles/product.css';

// SVGs for Allergens to match the "Anti-Slop" premium feel
const AllergenIcon = ({ name, path }) => (
  <div className="allergen-item">
    <div className="allergen-icon-circle">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {path}
      </svg>
    </div>
    <span className="allergen-name">{name}</span>
  </div>
);

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quickAdd } = useApp();
  const { user, openAuthModal } = useAuth();

  const cakeId = parseInt(id, 10);
  const cake = CAKES.find((c) => c.id === cakeId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAction = (action) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (action === "add") {
      quickAdd(cake.name, cake.price);
    } else if (action === "customize") {
      navigate("/customize");
    }
  };

  if (!cake) {
    return (
      <div className="page active" style={{ padding: "120px 20px", textAlign: "center" }}>
        <h2>Product not found.</h2>
        <button className="btn-primary" onClick={() => navigate("/bakery")}>Back to Bakery</button>
      </div>
    );
  }

  // Generate some mock ingredients based on the name to make it look realistic
  const getIngredients = (name) => {
    return `${name} [wheat flour (gluten), butter (milk), pearl sugar, water, eggs, yeast, invert sugar, milk powder, salt, natural vanilla flavor], Coating chocolate, Sugar powder.`;
  };

  return (
    <div className="page active product-page">
      <div className="product-container">
        
        {/* Left Column */}
        <div className="product-column product-left">
          <div className="product-image-wrapper">
            <img src={cake.img} alt={cake.name} className="product-main-image" />
          </div>
          
          <div className="product-ingredients-section">
            <h3 className="section-label">INGREDIENTS</h3>
            <p className="ingredients-text">{getIngredients(cake.name)}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="product-column product-right">
          <h1 className="product-title">{cake.name}</h1>

          <div className="product-nutrition-section">
            <div className="nutrition-header">
              <span className="nutrition-heading">Nutritional Information | Per Serving</span>
            </div>
            <table className="nutrition-table">
              <tbody>
                <tr>
                  <td>Calories</td>
                  <td>430</td>
                </tr>
                <tr>
                  <td>Total Fat (g)</td>
                  <td>24</td>
                </tr>
                <tr>
                  <td>Saturated Fat (g)</td>
                  <td>16</td>
                </tr>
                <tr>
                  <td>Trans Fat (g)</td>
                  <td>0</td>
                </tr>
                <tr>
                  <td>Total Carbohydrate (g)</td>
                  <td>49</td>
                </tr>
                <tr>
                  <td>Total Sugar (g)</td>
                  <td>26</td>
                </tr>
                <tr>
                  <td>Protein (g)</td>
                  <td>5(g)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="product-allergens-section">
            <h3 className="section-label">ALLERGENS</h3>
            <div className="allergens-grid">
              <AllergenIcon name="Wheat" path={<path d="M12 21v-8m0 0a4 4 0 014-4h1a4 4 0 00-4-4 4 4 0 00-4 4h1a4 4 0 014 4z" />} />
              <AllergenIcon name="Milk" path={<path d="M7 6v12a2 2 0 002 2h6a2 2 0 002-2V6M7 6h10M7 6l2-4h6l2 4" />} />
              <AllergenIcon name="Egg" path={<path d="M12 22c4.418 0 8-4.477 8-10S16.418 2 12 2 4 6.477 4 12s3.582 10 8 10z" />} />
              <AllergenIcon name="Soy" path={<path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zM8 12a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zm-4 6a2 2 0 100-4 2 2 0 000 4z" />} />
              <AllergenIcon name="Tree Nut" path={<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm2 14c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3zm-4-8c-1.5 0-2.5-.5-2.5-2S8.5 4 10 4s2.5.5 2.5 2T10 8z" />} />
            </div>
          </div>

          <div className="product-disclaimer">
            2,000 Calories a day is used for general nutrition advice, but calorie needs may vary. Additional nutritional information available upon request. Customization of your order may impact the accuracy and/or completeness of the available nutritional information. <a href="#">Allergen and Nutrition Information</a>
          </div>

          <div className="product-actions-bar">
            <div className="product-price-large">Rs {cake.price.toLocaleString()}</div>
            <div className="product-buttons">
              <button className="btn-sage product-btn" onClick={() => handleAction("add")}>
                Add to Cart
              </button>
              <button className="btn-rose product-btn" onClick={() => handleAction("customize")}>
                Customize Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import '../styles/product.css';
