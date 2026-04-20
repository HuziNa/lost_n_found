import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBakeryMenuProduct } from '../api/bakery';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function CustomizePage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const { user, openAuthModal } = useAuth();
  const canOrder = user?.role === 'customer';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['menuProduct', productId],
    queryFn: () => getBakeryMenuProduct(productId),
    enabled: !!productId,
  });

  const product = data?.product;

  const [selectedOptions, setSelectedOptions] = useState({});
  const [optionError, setOptionError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedOptions({});
    setOptionError('');
    setCurrentStep(0);
  }, [product?.id]);

  // ── Price calculation (mirrors ProductPage.jsx exactly) ──────────────────
  const extraPrice = useMemo(() => {
    if (!product?.options?.length) return 0;
    let total = 0;
    product.options.forEach((option) => {
      const selections = selectedOptions[option.name] || [];
      selections.forEach((selection) => {
        const choice = option.choices.find((c) => c.name === selection.choiceName);
        if (choice) total += Number(choice.extraPrice || 0);
      });
    });
    return total;
  }, [product, selectedOptions]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.basePrice || 0) + extraPrice;
  }, [product, extraPrice]);

  // ── Toggle a choice on/off (mirrors ProductPage.jsx exactly) ─────────────
  const toggleChoice = (option, choice) => {
    setOptionError('');
    setSelectedOptions((prev) => {
      const current = prev[option.name] || [];
      const maxSelections =
        option.maxSelections === null ? Infinity : Number(option.maxSelections || 1);
      const isMulti = maxSelections > 1;
      const alreadySelected = current.find((e) => e.choiceName === choice.name);

      // Single-select: replace
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

      // Multi-select: deselect if already chosen
      if (alreadySelected) {
        return {
          ...prev,
          [option.name]: current.filter((e) => e.choiceName !== choice.name),
        };
      }

      // Multi-select: cap at maxSelections
      if (current.length >= maxSelections) return prev;

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

  // ── Update layer for a perLayer option ───────────────────────────────────
  const updateLayer = (optionName, choiceName, layer) => {
    setSelectedOptions((prev) => {
      const current = prev[optionName] || [];
      return {
        ...prev,
        [optionName]: current.map((e) =>
          e.choiceName === choiceName ? { ...e, layer: Number(layer) || 1 } : e
        ),
      };
    });
  };

  // ── Build payload array for addToCart (mirrors ProductPage.jsx exactly) ──
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

  // ── Validate required options ─────────────────────────────────────────────
  const validateSelections = () => {
    if (!product?.options?.length) return true;
    const missing = product.options.filter(
      (option) => option.required && !(selectedOptions[option.name] || []).length
    );
    if (missing.length > 0) {
      setOptionError(
        `Please select: ${missing.map((o) => o.name).join(', ')}`
      );
      return false;
    }
    setOptionError('');
    return true;
  };

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!canOrder) {
      alert('Only customers can add items to the cart.');
      return;
    }
    if (!validateSelections()) return;

    addToCart({
      productId: product.id,
      bakeryId: product.bakeryId,
      name: product.name,
      detail: 'Customized order',
      price: displayPrice,
      icon: 'cake',
      selectedOptions: buildSelectedPayload(),
    });

    navigate(-1); // Go back after adding
  };

  // ── Steps: each option is one step ───────────────────────────────────────
  const options = product?.options || [];
  const totalSteps = options.length;
  const currentOption = options[currentStep];

  const goNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="customize-page">
        <p className="customize-loading">Loading product...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="customize-page">
        <p className="customize-error">Product not found.</p>
        <button onClick={() => navigate('/bakery')}>Back to Bakery</button>
      </div>
    );
  }

  return (
    <div className="customize-page">
      {/* Header */}
      <div className="customize-header">
        <button className="customize-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="customize-title">Customize {product.name}</h1>
        <div className="customize-price">Rs {displayPrice.toLocaleString()}</div>
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div className="customize-progress">
          {options.map((opt, i) => (
            <button
              key={opt.name}
              className={`customize-step-dot ${i === currentStep ? 'active' : ''} ${
                (selectedOptions[opt.name] || []).length > 0 ? 'done' : ''
              }`}
              onClick={() => setCurrentStep(i)}
              title={opt.name}
            />
          ))}
        </div>
      )}

      {/* Current option step */}
      {totalSteps === 0 ? (
        <div className="customize-no-options">
          <p>This product has no customization options.</p>
        </div>
      ) : (
        <div className="customize-step">
          <div className="customize-step-header">
            <h2 className="customize-option-name">
              {currentOption.name}
              {currentOption.required && <span className="required-badge"> *</span>}
            </h2>
            {currentOption.maxSelections && currentOption.maxSelections > 1 && (
              <span className="customize-hint">
                Choose up to {currentOption.maxSelections}
              </span>
            )}
          </div>

          <div className="customize-choices">
            {currentOption.choices.map((choice) => {
              const selected = (selectedOptions[currentOption.name] || []).find(
                (e) => e.choiceName === choice.name
              );
              const isSelected = !!selected;
              const isRadio =
                currentOption.maxSelections === null
                  ? false
                  : Number(currentOption.maxSelections || 1) === 1;

              return (
                <div
                  key={choice.name}
                  className={`customize-choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleChoice(currentOption, choice)}
                >
                  <span className="choice-selector">
                    {isRadio ? (
                      <span className={`radio-dot ${isSelected ? 'filled' : ''}`} />
                    ) : (
                      <span className={`checkbox-box ${isSelected ? 'checked' : ''}`}>
                        {isSelected && '✓'}
                      </span>
                    )}
                  </span>
                  <span className="choice-name">{choice.name}</span>
                  {Number(choice.extraPrice) > 0 && (
                    <span className="choice-price">+Rs {Number(choice.extraPrice).toLocaleString()}</span>
                  )}

                  {/* Per-layer selector */}
                  {currentOption.perLayer && isSelected && (
                    <select
                      className="layer-select"
                      value={selected.layer || 1}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateLayer(currentOption.name, choice.name, e.target.value)
                      }
                    >
                      {[1, 2, 3, 4].map((l) => (
                        <option key={l} value={l}>Layer {l}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error message */}
      {optionError && (
        <div className="customize-error-msg">{optionError}</div>
      )}

      {/* Navigation */}
      <div className="customize-nav">
        <button
          className="customize-nav-btn secondary"
          onClick={goPrev}
          disabled={currentStep === 0}
        >
          Previous
        </button>

        {currentStep < totalSteps - 1 ? (
          <button className="customize-nav-btn primary" onClick={goNext}>
            Next
          </button>
        ) : (
          <button className="customize-nav-btn add-to-cart" onClick={handleAddToCart}>
            Add to Cart — Rs {displayPrice.toLocaleString()}
          </button>
        )}
      </div>
    </div>
  );
}
