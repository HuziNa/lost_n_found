import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBakeryMenuProduct } from "../api/bakery";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getProductImageWithCategoryFallback } from "../utils/categoryImages";
import "../styles/product.css";

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
  const { addToCart, quickAdd } = useApp();
  const { user, openAuthModal } = useAuth();
  const canOrder = user?.role === "customer";

  const productQuery = useQuery({
    queryKey: ["menuProduct", id],
    queryFn: () => getBakeryMenuProduct(id),
    enabled: !!id,
  });

  const product = productQuery.data?.product;
  const [errorStatus, setErrorStatus] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const nutritionEntries = useMemo(() => {
    const nutrition = product?.nutrition || {};
    return Object.entries(nutrition);
  }, [product]);

  const isCustomizable = product?.type === "CUSTOMIZABLE" || Boolean(product?.selectedTemplate);
  const hasCustomizationOptions = Boolean(product?.options?.length) || Boolean(product?.selectedTemplate);

  const handleAction = (action) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!canOrder) {
      alert("Only customers can add items to the cart.");
      return;
    }

    if (!product) return;

    if (action === "add") {
      quickAdd(product);
    } else if (action === "customize") {
      if (!isCustomizable) {
        setErrorStatus("This product is not available for customization.");
        return;
      }
      // Use the id from params or product.id, and product.categoryId
      const pid = product.id || id;
      const catId = product.categoryId || product.category?._id || product.category?.id || "unknown";
      navigate(`/customize/${catId}/${pid}`);
    }
  };

  if (productQuery.isLoading) {
    return (
      <div className="page active" style={{ padding: "120px 20px", textAlign: "center" }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="page active" style={{ padding: "120px 20px", textAlign: "center" }}>
        <h2>Product not found.</h2>
        <button className="btn-primary" onClick={() => navigate("/bakery")}>Back to Bakery</button>
      </div>
    );
  }

  return (
    <div className="page active product-page">
      <div className="product-container">
        <div className="product-column product-left">
          <div className="product-image-wrapper">
            <img
              src={getProductImageWithCategoryFallback(product)}
              alt={product.name}
              className="product-main-image"
            />
          </div>

          <div className="product-ingredients-section">
            <h3 className="section-label">INGREDIENTS</h3>
            <p className="ingredients-text">
              {product.ingredientsText || "Ingredient details are managed by the bakery."}
            </p>
            {product.ingredients?.length > 0 && (
              <ul style={{ marginTop: "10px", paddingLeft: "18px", color: "var(--ink-soft)", fontSize: "13px" }}>
                {product.ingredients.map((item, index) => (
                  <li key={`${item.ingredientId || "ingredient"}-${index}`}>
                    {(item.name || item.ingredientName || `Ingredient ${index + 1}`)}: {Number(item.quantity || 0)}
                    {item.unit ? ` ${item.unit}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="product-column product-right">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-desc" style={{ color: "var(--ink-muted)" }}>
            {product.description || (product.category?.name ? `Category: ${product.category.name}` : "Bakery collection")}
          </p>

          {isCustomizable && (
            <div className="product-customize-banner">
              <div className="customize-banner-content">
                <span className="banner-icon">✦</span>
                <div>
                  <div className="banner-title">Make it uniquely yours</div>
                  <div className="banner-text">Personalize flavors, toppings, and design in our premium builder.</div>
                </div>
              </div>
              <button className="btn-rose" onClick={() => handleAction("customize")}>
                Start Customizing
              </button>
            </div>
          )}

          <div className="product-nutrition-section">
            <div className="nutrition-header">
              <span className="nutrition-heading">Nutritional Information</span>
            </div>
            {nutritionEntries.length > 0 ? (
              <table className="nutrition-table">
                <tbody>
                  {nutritionEntries.map(([label, value]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: "var(--ink-muted)", fontSize: "13px" }}>Nutrition details are not available.</div>
            )}
          </div>

          <div className="product-allergens-section">
            <h3 className="section-label">ALLERGENS</h3>
            {product.allergens?.length ? (
              <div className="allergens-grid">
                {product.allergens.map((allergen) => (
                  <AllergenIcon
                    key={allergen}
                    name={allergen}
                    path={<path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />}
                  />
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--ink-muted)", fontSize: "13px" }}>Allergen details are not listed.</div>
            )}
          </div>

          <div className="product-disclaimer" style={{ marginTop: "24px", fontSize: "12px", fontStyle: "italic" }}>
            Additional product details are available upon request from the bakery.
          </div>

          {errorStatus && <div className="option-error-message" style={{ color: "#d9534f", marginTop: "10px" }}>{errorStatus}</div>}

          <div className="product-actions-bar" style={{ marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
            <div className="product-price-large" style={{ fontSize: "24px", fontWeight: "300" }}>Rs {Number(product.basePrice || 0).toLocaleString()}</div>
            <div className="product-buttons" style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              {!isCustomizable && (
                <button className="btn-sage product-btn" onClick={() => handleAction("add")} style={{ flex: 1, padding: "14px" }}>
                  Add to Cart
                </button>
              )}
              {isCustomizable && (
                <button
                  className="btn-rose product-btn"
                  onClick={() => handleAction("customize")}
                  style={{ flex: 1, padding: "14px" }}
                > 
                  Customize Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
