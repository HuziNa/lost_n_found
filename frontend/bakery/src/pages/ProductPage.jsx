import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBakeryMenuProduct } from "../api/bakery";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
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

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1509409137281-5a36f620dddf?w=1200&q=80&auto=format&fit=crop";

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
  const [selectedOptions, setSelectedOptions] = useState({});
  const [optionError, setOptionError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setSelectedOptions({});
    setOptionError("");
  }, [product?.id]);

  const nutritionEntries = useMemo(() => {
    const nutrition = product?.nutrition || {};
    return Object.entries(nutrition);
  }, [product]);

  const extraPrice = useMemo(() => {
    if (!product?.options?.length) return 0;
    let total = 0;
    product.options.forEach((option) => {
      const selections = selectedOptions[option.name] || [];
      selections.forEach((selection) => {
        const choice = option.choices.find((item) => item.name === selection.choiceName);
        if (choice) {
          total += Number(choice.extraPrice || 0);
        }
      });
    });
    return total;
  }, [product, selectedOptions]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.basePrice || 0) + extraPrice;
  }, [product, extraPrice]);

  const toggleChoice = (option, choice) => {
    setSelectedOptions((prev) => {
      const current = prev[option.name] || [];
      const maxSelections = option.maxSelections === null ? Infinity : Number(option.maxSelections || 1);
      const isMulti = maxSelections > 1;
      const alreadySelected = current.find((entry) => entry.choiceName === choice.name);

      if (!isMulti) {
        return {
          ...prev,
          [option.name]: [
            {
              choiceName: choice.name,
              layer: option.perLayer ? 1 : undefined,
            },
          ],
        };
      }

      if (alreadySelected) {
        return {
          ...prev,
          [option.name]: current.filter((entry) => entry.choiceName !== choice.name),
        };
      }

      if (current.length >= maxSelections) {
        return prev;
      }

      return {
        ...prev,
        [option.name]: [
          ...current,
          {
            choiceName: choice.name,
            layer: option.perLayer ? 1 : undefined,
          },
        ],
      };
    });
  };

  const updateLayer = (optionName, choiceName, layer) => {
    setSelectedOptions((prev) => {
      const current = prev[optionName] || [];
      return {
        ...prev,
        [optionName]: current.map((entry) =>
          entry.choiceName === choiceName
            ? { ...entry, layer: Number(layer) || 1 }
            : entry
        ),
      };
    });
  };

  const buildSelectedPayload = () => {
    if (!product?.options?.length) return [];
    const selections = [];
    product.options.forEach((option) => {
      const selected = selectedOptions[option.name] || [];
      selected.forEach((entry) => {
        selections.push({
          optionName: option.name,
          choiceName: entry.choiceName,
          ...(option.perLayer ? { layer: entry.layer || 1 } : {}),
        });
      });
    });
    return selections;
  };

  const validateSelections = () => {
    if (!product?.options?.length) return true;
    const missing = product.options.filter(
      (option) => option.required && !(selectedOptions[option.name] || []).length
    );
    if (missing.length > 0) {
      setOptionError("Please select all required options before adding to cart.");
      return false;
    }
    setOptionError("");
    return true;
  };

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

    if (product.type === "CUSTOMIZABLE" && !validateSelections()) {
      return;
    }

    if (action === "add") {
      if (product.type === "CUSTOMIZABLE") {
        addToCart({
          productId: product.id,
          bakeryId: product.bakeryId,
          name: product.name,
          detail: "Customize order",
          price: displayPrice,
          icon: "cake",
          selectedOptions: buildSelectedPayload(),
        });
      } else {
        quickAdd(product);
      }
    } else if (action === "customize") {
      navigate(`/customize`);
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
              src={product.imageUrl || DEFAULT_IMAGE}
              alt={product.name}
              className="product-main-image"
            />
          </div>

          <div className="product-ingredients-section">
            <h3 className="section-label">INGREDIENTS</h3>
            <p className="ingredients-text">
              {product.ingredientsText || "Ingredient details are managed by the bakery."}
            </p>
          </div>
        </div>

        <div className="product-column product-right">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-actions-bar">
            <div className="product-price-large">Rs {displayPrice.toLocaleString()}</div>
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