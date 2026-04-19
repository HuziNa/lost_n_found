import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import OrderSidebar from "../components/customize/OrderSidebar";
import ProductPreview from "../components/customize/ProductPreview";
import DynamicSteps from "../components/customize/DynamicSteps";
import { useApp } from "../context/AppContext";

const PRODUCT_CONFIGS = {
  cake: {
    title: "Build Your Cake",
    subtitle: "Customize every detail — your dream cake, exactly the way you want it.",
    breadcrumb: "Bespoke Cake",
    steps: [
      { key: "size", title: "Choose Your Size", required: true },
      { key: "layers", title: "Number of Layers", required: true },
      { key: "frosting", title: "Choose Your Frosting", required: true },
      { key: "toppings", title: "Add Toppings", required: false },
      { key: "message", title: "Message on Cake", required: false },
      { key: "decorations", title: "Candles & Decorations", required: false }
    ]
  },
  pizza: {
    title: "Build Your Pizza",
    subtitle: "Craft your perfect pizza with fresh ingredients and endless possibilities.",
    breadcrumb: "Custom Pizza",
    steps: [
      { key: "size", title: "Choose Your Size", required: true },
      { key: "crust", title: "Select Crust Type", required: true },
      { key: "sauce", title: "Choose Your Sauce", required: true },
      { key: "cheese", title: "Cheese Options", required: false },
      { key: "toppings", title: "Add Toppings", required: false },
      { key: "special", title: "Special Instructions", required: false }
    ]
  },
  donut: {
    title: "Build Your Donut",
    subtitle: "Create your perfect donut with premium glazes and fillings.",
    breadcrumb: "Custom Donut",
    steps: [
      { key: "size", title: "Choose Your Size", required: true },
      { key: "base", title: "Donut Base", required: true },
      { key: "filling", title: "Choose Filling", required: false },
      { key: "glaze", title: "Select Glaze", required: true },
      { key: "sprinkles", title: "Add Sprinkles", required: false },
      { key: "drizzle", title: "Chocolate Drizzle", required: false }
    ]
  },
  cupcake: {
    title: "Build Your Cupcake",
    subtitle: "Design your ideal cupcake with premium flavors and decorations.",
    breadcrumb: "Custom Cupcake",
    steps: [
      { key: "quantity", title: "Choose Quantity", required: true },
      { key: "base", title: "Cupcake Base", required: true },
      { key: "filling", title: "Choose Filling", required: false },
      { key: "frosting", title: "Select Frosting", required: true },
      { key: "toppings", title: "Add Toppings", required: false },
      { key: "decorations", title: "Decorations", required: false }
    ]
  }
};

export default function CustomizePage() {
  const [openStep, setOpenStep] = useState(1);
  const [productType, setProductType] = useState("cake");
  const { state } = useApp();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type") || "cake";
    if (PRODUCT_CONFIGS[type]) {
      setProductType(type);
    }
  }, [location.search]);

  const config = PRODUCT_CONFIGS[productType] || PRODUCT_CONFIGS.cake;
  const toggleStep = (step) => setOpenStep(openStep === step ? 0 : step);

  return (
    <div className="page active" id="page-customize">
      <div className="custom-page">
        <div className="custom-breadcrumb">
          <Link to="/"><span>Home</span></Link>
          <span style={{ color: "var(--ink-muted)", margin: "0 8px" }}>›</span>
          <Link to="/"><span>Collection</span></Link>
          <span style={{ color: "var(--ink-muted)", margin: "0 8px" }}>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{config.breadcrumb}</span>
        </div>
        <h1 className="custom-title">{config.title}</h1>
        <p className="custom-subtitle">{config.subtitle}</p>

        {/* Using grid to match CSS .custom-layout which is display:grid */}
        <div
          className="custom-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "40px",
            marginTop: "40px",
            alignItems: "start",
          }}
        >
          <div className="steps-container">
            <DynamicSteps
              productType={productType}
              config={config}
              openStep={openStep}
              toggleStep={toggleStep}
              state={state}
            />
          </div>

          {/* Sticky wrapper — alignSelf:"start" is correct for grid */}
          <div
            style={{
              position: "sticky",
              top: "120px",
              alignSelf: "start",
              height: "fit-content",
            }}
          >
            <ProductPreview productType={productType} state={state} />
            <OrderSidebar productType={productType} />
          </div>
        </div>
      </div>
    </div>
  );
}
