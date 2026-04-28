import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBakeryMenuProduct } from "../api/bakery";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getTemplateByCategory } from "../constants/customizerTemplates";
import CustomizerSVG from "../components/customize/CustomizerSVG";
import "./CustomizePage.css";

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

const PRESET_COLORS = {
  "Classic White": "#ffffff",
  "Lavender Mist": "#E6E6FA",
  "Soft Pink": "#FFB7C5",
  "Mint Green": "#98FF98",
  "Lemon Sorbet": "#FFF44F",
  "Chocolate Ganache": "#3D2B1F",
  "Caramel Cream": "#C68E17",
  "Midnight Silk": "#1C1C1C",
};

export default function BreadCustomizePage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const { user, openAuthModal } = useAuth();
  const canOrder = user?.role === "customer";
  const heroSubtitle = "Shape the loaf, choose the bake, and finish with seeds or glaze.";
  const orderTitle = "Your Artisan Bread";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["menuProduct", productId],
    queryFn: () => getBakeryMenuProduct(productId),
    enabled: !!productId,
  });

  const product = data?.product;
  const rawOptions = product?.options || [];
  const template = useMemo(() => getTemplateByCategory(product?.categoryName || product?.category?.name), [product]);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [openStepKeys, setOpenStepKeys] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [voucherCode, setVoucherCode] = useState("");

  // Filter segments to only show configured ones
  const displayedSegments = useMemo(() => {
    const list = [];
    if (template) {
      for (let index = 0; index < template.segments.length; index += 1) {
        const seg = template.segments[index];

        if (seg.key === "frosting_flavor") {
          const colorSeg = template.segments[index + 1];
          const flavorOption = rawOptions.find((option) => option.templateKey === "frosting_flavor");
          const colorOption = rawOptions.find((option) => option.templateKey === "frosting_color");

          if (flavorOption || colorOption) {
            list.push({
              key: "frosting",
              name: "Choose Your Frosting",
              type: "combined",
              layout: "frosting_combo",
              required: !!(flavorOption?.required || colorOption?.required),
              flavorOption: flavorOption || null,
              colorOption: colorOption || null,
            });
          }

          if (colorSeg?.key === "frosting_color") {
            index += 1;
          }
          continue;
        }

        if (seg.key === "frosting_color") {
          continue;
        }

        const option = rawOptions.find((o) => o.templateKey === seg.key);
        if (option || seg.key === "message") {
          list.push({
            key: seg.key,
            name: seg.name,
            type: "standard",
            option: option || null,
            layout: seg.layout,
            required: !!option?.required,
          });
        }
      }

      // Add custom options not in template
      rawOptions.forEach(o => {
        if (!o.templateKey) {
          list.push({
            key: o.name,
            name: o.name,
            type: "custom",
            option: o,
            layout: "grid"
          });
        }
      });
    } else {
      rawOptions.forEach(o => {
        list.push({
          key: o.name,
          name: o.name,
          type: "custom",
          option: o,
          layout: "grid"
        });
      });
    }
    return list;
  }, [template, rawOptions]);

  // Open first step by default
  useEffect(() => {
    if (displayedSegments.length > 0 && openStepKeys.length === 0) {
      setOpenStepKeys(displayedSegments.filter((segment) => segment.required).map((segment) => segment.key));
    }
  }, [displayedSegments, openStepKeys.length]);

  const isStepOpen = (key) => openStepKeys.includes(key);

  const toggleStep = (key) => {
    setOpenStepKeys((prev) => (
      prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]
    ));
  };

  const extraPrice = useMemo(() => {
    let total = 0;
    Object.values(selectedOptions).forEach((selections) => {
      selections.forEach((s) => {
        total += Number(s.extraPrice || 0);
      });
    });
    return total;
  }, [selectedOptions]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.basePrice || 0) + extraPrice;
  }, [product, extraPrice]);

  const getChoiceSummary = (optionKey) => {
    const selections = selectedOptions[optionKey] || [];
    return selections.length > 0 ? selections.map((item) => item.name).join(", ") : "Optional";
  };

  const getFrostingSummary = () => {
    const flavor = getChoiceSummary("frosting_flavor");
    const color = getChoiceSummary("frosting_color");
    if (flavor === "Optional" && color === "Optional") return "Optional";
    return `${flavor !== "Optional" ? flavor : "No flavor"} · ${color !== "Optional" ? color : "No color"}`;
  };

  const toggleChoice = (optionKey, choice, maxSelections = 1) => {
    if (choice.inStock === false) return;

    setSelectedOptions((prev) => {
      const current = prev[optionKey] || [];
      const alreadySelected = current.find((c) => c.name === choice.name);

      if (maxSelections === 1) {
        return {
          ...prev,
          [optionKey]: [{ name: choice.name, extraPrice: choice.extraPrice }],
        };
      }

      if (alreadySelected) {
        return {
          ...prev,
          [optionKey]: current.filter((c) => c.name !== choice.name),
        };
      }

      if (current.length >= maxSelections) return prev;

      return {
        ...prev,
        [optionKey]: [...current, { name: choice.name, extraPrice: choice.extraPrice }],
      };
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!canOrder) {
      alert("Only customers can add items to the cart.");
      return;
    }
    if (!product) return;

    const selections = [];
    rawOptions.forEach((option) => {
      const key = option.templateKey || option.name;
      const selected = selectedOptions[key] || [];
      selected.forEach((s) => {
        selections.push({
          optionName: option.name,
          choiceName: s.name,
        });
      });
    });

    if (customMessage) {
        selections.push({
        optionName: "Message",
            choiceName: `${customMessage} (Font: ${selectedFont})`
        });
    }

    addToCart({
      productId: product.id,
      bakeryId: product.bakeryId,
      name: product.name,
      detail: "Customized order",
      price: displayPrice,
      icon: "cake",
      selectedOptions: selections,
    });

    navigate(-1);
  };

  const handleShareDesign = async () => {
    const shareText = `${product.name} customized with ${displayPrice} total.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Customize ${product.name}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard below.
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
    }
  };

  if (isLoading) return <div className="customize-page">Loading builder...</div>;
  if (isError || !product) return <div className="customize-page">Product not found.</div>;

  const svgSelections = {};
  Object.entries(selectedOptions).forEach(([k, v]) => {
    if (v.length > 0) {
      if (k === "toppings" || k === "topping") {
        svgSelections[k] = v.map(item => item.name);
      } else {
        svgSelections[k] = v[0].name;
      }
    }
  });

  return (
    <div className="customize-page">
      <div className="customize-shell">
        <div className="custom-breadcrumb">
          <span onClick={() => navigate("/")}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/bakery")}>Bakery</span>
          <span>›</span>
          <span className="current">Customize {product.name}</span>
        </div>

        <h1 className="custom-title">Build Your <em>{product.name}</em></h1>
        <p className="custom-subtitle">{heroSubtitle}</p>

        <div className="custom-layout">
          <div className="steps-container">
            {displayedSegments.map((seg, idx) => {
              const isOpen = isStepOpen(seg.key);
              const selections = selectedOptions[seg.key] || [];
              const summary = seg.key === "message"
                ? (customMessage ? `"${customMessage}"` : "Optional")
                : seg.key === "frosting"
                  ? getFrostingSummary()
                  : selections.length > 0
                    ? selections.map((selection) => selection.name).join(", ")
                    : (seg.required ? "Required" : "Optional");

              return (
                <div key={seg.key} className={`step-card ${isOpen ? "open" : ""}`}>
                  <div className="step-header" onClick={() => toggleStep(seg.key)}>
                    <div className={`step-num ${selections.length > 0 || (seg.key === 'message' && customMessage) || (seg.key === "frosting" && (selectedOptions.frosting_flavor?.length || selectedOptions.frosting_color?.length)) ? "done" : ""}`}>{idx + 1}</div>
                    <div className="step-content">
                      <div className="step-title">{seg.name}</div>
                      <div className="step-subtitle">{summary}</div>
                    </div>
                    <div className="step-chevron">▾</div>
                  </div>

                  {isOpen && (
                    <div className="step-body">
                      {seg.key === "message" ? (
                        <div className="message-setup">
                          <textarea 
                            className="msg-input" 
                            placeholder="Type your message here..."
                            maxLength={50}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            style={{ fontFamily: selectedFont === 'Inter' ? 'inherit' : `'${selectedFont}', cursive` }}
                          />
                          <div className="msg-counter">{customMessage.length}/50 characters</div>
                          <div className="font-label">Choose a Style</div>
                          <div className="font-previews">
                            {['Inter', 'Playfair Display', 'Dancing Script'].map(font => (
                                <button 
                                    key={font} 
                                    className={`font-btn ${selectedFont === font ? "selected" : ""}`}
                                    onClick={() => setSelectedFont(font)}
                                    style={{ fontFamily: font === 'Inter' ? 'inherit' : `'${font}', cursive` }}
                                >
                                    {font === 'Inter' ? 'Modern' : font === 'Dancing Script' ? 'Elegant' : 'Classic'}
                                </button>
                            ))}
                          </div>
                        </div>
                      ) : seg.key === "frosting" ? (
                        <div className="frosting-combo">
                          <div className="combo-group">
                            <div className="combo-label">Flavor</div>
                            <div className="frost-flavors">
                              {(seg.flavorOption?.choices || []).map((choice) => {
                                const isSelected = (selectedOptions.frosting_flavor || []).some((item) => item.name === choice.name);
                                return (
                                  <button
                                    key={choice.name}
                                    type="button"
                                    className={`frost-btn ${isSelected ? "selected" : ""}`}
                                    onClick={() => toggleChoice("frosting_flavor", choice, Number(seg.flavorOption?.maxSelections) || 1)}
                                  >
                                    {choice.name}
                                    {choice.extraPrice > 0 && <span className="extra-tag"> +Rs {choice.extraPrice}</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="combo-group combo-group-color">
                            <div className="combo-label">Frosting Color</div>
                            <div className="color-swatches frosting-swatches">
                              {(seg.colorOption?.choices || []).map((choice) => {
                                const isSelected = (selectedOptions.frosting_color || []).some((item) => item.name === choice.name);
                                const hex = PRESET_COLORS[choice.name] || choice.name.toLowerCase();
                                return (
                                  <div
                                    key={choice.name}
                                    className={`swatch-wrap ${isSelected ? "selected" : ""}`}
                                    onClick={() => toggleChoice("frosting_color", choice, Number(seg.colorOption?.maxSelections) || 1)}
                                  >
                                    <div className="swatch-color" style={{ background: hex }}></div>
                                    <div className="swatch-label">{choice.name}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : seg.layout === "swatches" ? (
                         <div className="color-swatches">
                            {seg.option.choices.map(choice => {
                                const isSelected = selections.some(s => s.name === choice.name);
                                const hex = PRESET_COLORS[choice.name] || choice.name.toLowerCase();
                                return (
                                    <div 
                                        key={choice.name} 
                                        className={`swatch-wrap ${isSelected ? "selected" : ""}`}
                                        onClick={() => toggleChoice(seg.key, choice, seg.option.maxSelections || 1)}
                                    >
                                        <div className="swatch-color" style={{ background: hex }}></div>
                                        <div className="swatch-label">{choice.name}</div>
                                    </div>
                                );
                            })}
                         </div>
                      ) : seg.layout === "grid_check" || seg.layout === "grid" ? (
                        <div className="toppings-grid">
                          {seg.option.choices.map((choice) => {
                            const isSelected = selections.some(s => s.name === choice.name);
                            const isOOS = choice.inStock === false;

                            return (
                              <div
                                key={choice.name}
                                className={`topping-card ${isSelected ? "selected" : ""} ${isOOS ? "out-of-stock" : ""}`}
                                onClick={() => toggleChoice(seg.key, choice, Number(seg.option.maxSelections) || 1)}
                              >
                                {isSelected && <div className="check">✓</div>}
                                <div className="topping-name">{choice.name}</div>
                                <div className="topping-price">
                                  {choice.extraPrice > 0 ? `+ Rs ${choice.extraPrice}` : "Included"}
                                </div>
                                {isOOS && <div className="opt-oos-badge">OOS</div>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="frost-flavors">
                            {seg.option.choices.map(choice => {
                                const isSelected = selections.some(s => s.name === choice.name);
                                return (
                                    <button 
                                        key={choice.name} 
                                        className={`frost-btn ${isSelected ? "selected" : ""}`}
                                        onClick={() => toggleChoice(seg.key, choice, Number(seg.option.maxSelections) || 1)}
                                    >
                                        {choice.name}
                                        {choice.extraPrice > 0 && <span className="extra-tag"> +Rs {choice.extraPrice}</span>}
                                    </button>
                                );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="order-sidebar">
            <div className="order-card shadow-premium">
              <div className="order-card-header">
                <div className="order-card-title">{orderTitle}</div>
              </div>

              <div className="order-preview">
                 <CustomizerSVG type={template?.label || "BREAD"} selections={svgSelections} product={product} />
              </div>

              <div className="order-summary">
                <div className="order-line">
                  <span className="line-label">{product.name}</span>
                  <span className="line-price">{formatCurrency(product.basePrice)}</span>
                </div>
                {Object.entries(selectedOptions).map(([key, selections]) => {
                  return selections.map(s => {
                    if (Number(s.extraPrice) <= 0) return null;
                    return (
                      <div key={`${key}-${s.name}`} className="order-line extra">
                        <span className="line-label">+ {s.name}</span>
                        <span className="line-price">{formatCurrency(s.extraPrice)}</span>
                      </div>
                    );
                  });
                })}
                {selectedOptions.frosting_flavor?.length > 0 && (
                  <div className="order-line extra">
                    <span className="line-label">+ Frosting Flavor</span>
                    <span className="line-price">{selectedOptions.frosting_flavor.map((item) => item.name).join(", ")}</span>
                  </div>
                )}
                {selectedOptions.frosting_color?.length > 0 && (
                  <div className="order-line extra">
                    <span className="line-label">+ Frosting Color</span>
                    <span className="line-price">{selectedOptions.frosting_color.map((item) => item.name).join(", ")}</span>
                  </div>
                )}
                {customMessage && (
                  <div className="order-line extra">
                    <span className="line-label">+ Personal Message</span>
                    <span className="line-price">Free</span>
                  </div>
                )}
                <div className="voucher-row">
                  <input
                    className="voucher-input"
                    value={voucherCode}
                    onChange={(event) => setVoucherCode(event.target.value)}
                    placeholder="Voucher code"
                    aria-label="Voucher code"
                  />
                  <button type="button" className="voucher-btn">
                    Apply
                  </button>
                </div>
                <div className="order-total">
                  <span>Total Amount</span>
                  <span>{formatCurrency(displayPrice)}</span>
                </div>
              </div>

              <div className="order-actions">
                <button className="btn-cart" onClick={handleAddToCart}>
                  Add to Shopping Bag
                </button>
                <div className="secondary-actions">
                  <button className="btn-save" onClick={() => navigate(-1)}>
                    Save Design
                  </button>
                  <span className="secondary-divider">/</span>
                  <button className="btn-save" onClick={handleShareDesign}>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
