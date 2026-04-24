import React from "react";

export default function CustomizerSVG({ type, selections, product }) {
  // selections is a map of templateKey -> selectedChoiceName(s)

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

  const getFill = (key, defaultColor = "#f9f1e7") => {
    const selection = selections[key];
    if (!selection) return defaultColor;

    // Check preset colors first
    if (PRESET_COLORS[selection]) return PRESET_COLORS[selection];

    // Fallback heuristic
    const name = String(selection).toLowerCase();
    if (name.includes("chocolate")) return "#3D2B1F";
    if (name.includes("vanilla")) return "#F3E5AB";
    if (name.includes("strawberry") || name.includes("pink")) return "#FFB7C5";
    if (name.includes("lavender")) return "#E6E6FA";
    if (name.includes("mint")) return "#98FF98";
    if (name.includes("lemon")) return "#FFF44F";
    if (name.includes("caramel")) return "#C68E17";
    if (name.includes("black") || name.includes("midnight")) return "#1C1C1C";

    return selection; // Might be a valid CSS color string already
  };

  const renderTopping = (name, x, y) => {
    const lower = name.toLowerCase();
    if (lower.includes("sprinkle")) {
      return (
        <g key={`${name}-${x}-${y}`}>
          <rect x={x} y={y} width="2" height="6" fill="#FFB7C5" transform={`rotate(${x % 360})`} />
          <rect x={x + 8} y={y + 2} width="2" height="6" fill="#98FF98" transform={`rotate(${(x + 45) % 360})`} />
          <rect x={x - 8} y={y - 2} width="2" height="6" fill="#FFF44F" transform={`rotate(${(x + 90) % 360})`} />
        </g>
      );
    }
    if (lower.includes("chocolate") || lower.includes("shaving")) {
      return (
        <path
          key={`${name}-${x}-${y}`}
          d={`M ${x} ${y} Q ${x + 4} ${y - 4} ${x + 8} ${y} Q ${x + 4} ${y + 4} ${x} ${y}`}
          fill="#3D2B1F"
          transform={`rotate(${x % 360}, ${x}, ${y})`}
        />
      );
    }
    if (lower.includes("berry") || lower.includes("fruit")) {
      return <circle key={`${name}-${x}-${y}`} cx={x} cy={y} r="5" fill="#C41E3A" />;
    }
    if (lower.includes("gold")) {
      return <path key={`${name}-${x}-${y}`} d={`M ${x} ${y} l 4 -2 l 4 2 l -4 2 z`} fill="#D4AF37" />;
    }
    // Generic dot for others
    return <circle key={`${name}-${x}-${y}`} cx={x} cy={y} r="3" fill="#888" />;
  };

  const renderCake = () => {
    const frostingColor = getFill("frosting_color", "#ffffff");

    // Tiers logic
    let numTiers = 1;
    const tierSelection = selections["tiers"];
    if (tierSelection) {
      if (tierSelection.toLowerCase().includes("2") || tierSelection.toLowerCase().includes("double")) numTiers = 2;
      if (tierSelection.toLowerCase().includes("3") || tierSelection.toLowerCase().includes("triple")) numTiers = 3;
    }

    const tierWidths = [180, 140, 100];
    const tierHeights = [50, 45, 40];
    const startY = 300;

    const toppingList = Array.isArray(selections["toppings"]) ? selections["toppings"] : (selections["toppings"] ? [selections["toppings"]] : []);

    return (
      <svg viewBox="0 0 400 400" className="svg-cake">
        {/* Base Plate */}
        <ellipse cx="200" cy="330" rx="140" ry="30" fill="#e0e0e0" />
        <ellipse cx="200" cy="325" rx="130" ry="25" fill="#f5f5f5" />

        {/* Tiers Rendering */}
        {[...Array(numTiers)].map((_, i) => {
          const w = tierWidths[i];
          const h = tierHeights[i];
          const x = 200 - w / 2;
          let currentY = startY;
          for (let j = 0; j < i; j++) currentY -= tierHeights[j];
          currentY -= h;

          return (
            <g key={i}>
              <rect x={x} y={currentY} width={w} height={h} fill={frostingColor} stroke="rgba(0,0,0,0.05)" />
              <rect x={x} y={currentY} width={w} height={6} fill="rgba(255,255,255,0.3)" />
              <path
                d={`M ${x} ${currentY + 6} Q ${x + w / 4} ${currentY + 12} ${x + w / 2} ${currentY + 6} Q ${x + 3 * w / 4} ${currentY + 12} ${x + w} ${currentY + 6}`}
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Toppings on Top Tier */}
        {toppingList.length > 0 && (
          <g transform={`translate(200, ${startY - tierHeights.slice(0, numTiers).reduce((a, b) => a + b, 0)})`}>
            {toppingList.flatMap((t, tIdx) => {
              const positions = [
                { x: -30, y: -5 }, { x: 0, y: -10 }, { x: 30, y: -5 },
                { x: -15, y: -2 }, { x: 15, y: -2 }, { x: 0, y: 0 }
              ];
              return positions.map((pos, pIdx) => renderTopping(t, pos.x + (tIdx * 2), pos.y - (tIdx * 2)));
            })}
          </g>
        )}
      </svg>
    );
  };

  const renderPizza = () => {
    // Determine Crust
    let crustColor = getFill("crust", "#d2b48c");
    let crustStrokeWidth = 4;
    let crustRadius = 160;
    const crustSelection = (selections["crust"] || "").toLowerCase();
    if (crustSelection.includes("stuffed") || crustSelection.includes("thick")) {
      crustStrokeWidth = 12;
    }

    // Determine Shape
    const shapeSelection = (selections["shape"] || selections["Shape"] || "").toLowerCase();
    const isSquare = shapeSelection.includes("square") || shapeSelection.includes("rectangle");

    // Determine Sauce
    const sauceSelection = (selections["sauce"] || "").toLowerCase();
    let sauceColor = "transparent"; // default plain dough
    if (sauceSelection.includes("tomato")) sauceColor = "#cc2a36";
    else if (sauceSelection.includes("bbq")) sauceColor = "#3D2B1F";
    else if (sauceSelection.includes("white") || sauceSelection.includes("garlic")) sauceColor = "#FFFDD0";
    else if (sauceSelection.includes("pesto")) sauceColor = "#228B22";
    else if (sauceSelection === "no sauce" || sauceSelection === "none") sauceColor = "transparent";
    else if (sauceSelection) sauceColor = getFill("sauce", "#cc2a36"); // fallback

    // Determine Cheese
    const cheeseSelection = (selections["cheese"] || "").toLowerCase();
    let cheeseColor = "#ffef00";
    let cheeseOpacity = 0.85;
    let cheeseRadius = 130;
    if (cheeseSelection.includes("extra") || cheeseSelection.includes("double")) {
      cheeseColor = "#ffcc00"; // more yellow
      cheeseOpacity = 0.95;
      cheeseRadius = 140; // thicker layer
    } else if (cheeseSelection.includes("no cheese") || cheeseSelection === "none") {
      cheeseOpacity = 0;
    }

    // Determine Spice
    const spiceSelection = (selections["spice"] || selections["Spice Level"] || "").toLowerCase();
    const isSpicy = spiceSelection.includes("hot") || spiceSelection.includes("spicy");

    const toppingList = Array.isArray(selections["toppings"]) ? selections["toppings"] : (selections["toppings"] ? [selections["toppings"]] : []);

    const renderPizzaTopping = (name, x, y) => {
      const lower = name.toLowerCase();
      if (lower.includes("pepperoni") || lower.includes("salami")) {
        return (
          <g key={`${name}-${x}-${y}`}>
            <circle cx={x} cy={y} r="14" fill="#a81c1c" />
            <circle cx={x - 4} cy={y - 4} r="2" fill="#8a1717" />
            <circle cx={x + 5} cy={y + 2} r="2.5" fill="#8a1717" />
            <circle cx={x - 1} cy={y + 6} r="1.5" fill="#8a1717" />
          </g>
        );
      }
      if (lower.includes("mushroom")) {
        return (
          <g key={`${name}-${x}-${y}`} transform={`rotate(${x % 360}, ${x}, ${y})`}>
            <path d={`M ${x - 6} ${y} Q ${x} ${y - 10} ${x + 6} ${y} Z`} fill="#d2c9b8" />
            <rect x={x - 2} y={y} width="4" height="6" fill="#d2c9b8" />
          </g>
        );
      }
      if (lower.includes("olive")) {
        return <circle key={`${name}-${x}-${y}`} cx={x} cy={y} r="5" fill="#1a1a1a" stroke="#000" strokeWidth="2" fillOpacity="0" />;
      }
      if (lower.includes("jalapeno") || lower.includes("jalapeño")) {
        return <circle key={`${name}-${x}-${y}`} cx={x} cy={y} r="6" fill="#2e8b57" stroke="#1f5e3d" strokeWidth="2" fillOpacity="0" />;
      }
      if (lower.includes("bell pepper") || lower.includes("capsicum") || lower.includes("pepper")) {
        return (
          <path key={`${name}-${x}-${y}`} d={`M ${x - 6} ${y - 2} Q ${x} ${y - 8} ${x + 6} ${y - 2} Q ${x + 8} ${y + 4} ${x} ${y + 4} Q ${x - 8} ${y + 4} ${x - 6} ${y - 2} Z`} fill="none" stroke="#32cd32" strokeWidth="3" transform={`rotate(${(x * 13) % 360}, ${x}, ${y})`} />
        );
      }
      if (lower.includes("corn")) {
        return <circle key={`${name}-${x}-${y}`} cx={x} cy={y} r="3" fill="#ffd700" />;
      }
      if (lower.includes("onion")) {
        return <path key={`${name}-${x}-${y}`} d={`M ${x - 8} ${y} Q ${x} ${y - 8} ${x + 8} ${y}`} fill="none" stroke="#dda0dd" strokeWidth="2" transform={`rotate(${(x * 7) % 360}, ${x}, ${y})`} />;
      }
      return <circle key={`${name}-${x}-${y}`} cx={x} cy={y} r="5" fill="#8b4513" />; // generic meat/chunk
    };

    const sizeSelection = (selections["size"] || "").toLowerCase();
    let scale = 1;
    if (sizeSelection.includes("small") || sizeSelection.includes("mini") || sizeSelection.includes("personal")) scale = 0.8;
    else if (sizeSelection.includes("large") || sizeSelection.includes("jumbo") || sizeSelection.includes("family")) scale = 1.2;
    else if (sizeSelection.includes("extra") || sizeSelection.includes("xl")) scale = 1.35;

    return (
      <svg viewBox="0 0 400 400" className="svg-pizza">
        <g transform={`translate(200, 200) scale(${scale}) translate(-200, -200)`}>
          {isSquare ? (
            <g transform="translate(40, 40)">
              <rect width="320" height="320" rx="20" fill={crustColor} stroke="#8b4513" strokeWidth={crustStrokeWidth} />
              <rect x="15" y="15" width="290" height="290" rx="10" fill={sauceColor} />
              <rect x="25" y="25" width="270" height="270" rx="10" fill={cheeseColor} opacity={cheeseOpacity} />
            </g>
          ) : (
            <g>
              <circle cx="200" cy="200" r={crustRadius} fill={crustColor} stroke="#8b4513" strokeWidth={crustStrokeWidth} />
              <circle cx="200" cy="200" r={crustRadius - 20} fill={sauceColor} />
              <circle cx="200" cy="200" r={cheeseRadius} fill={cheeseColor} opacity={cheeseOpacity} />
            </g>
          )}

          {/* Draw Toppings */}
          {toppingList.length > 0 && (
            <g transform="translate(200, 200)">
              {toppingList.flatMap((t, tIdx) => {
                // Determine placement grid
                const spread = isSquare ? 110 : 100;
                let positions = [
                  { x: -spread * 0.6, y: -spread * 0.6 }, { x: spread * 0.6, y: -spread * 0.6 }, { x: -spread * 0.6, y: spread * 0.6 }, { x: spread * 0.6, y: spread * 0.6 },
                  { x: 0, y: -spread * 0.8 }, { x: 0, y: spread * 0.8 }, { x: -spread * 0.8, y: 0 }, { x: spread * 0.8, y: 0 },
                  { x: -spread * 0.2, y: -spread * 0.2 }, { x: spread * 0.2, y: -spread * 0.2 }, { x: -spread * 0.2, y: spread * 0.2 }, { x: spread * 0.2, y: spread * 0.2 },
                  { x: 0, y: 0 }
                ];
                // Offset each topping type slightly so they don't perfectly overlap
                const offset = tIdx * 12;
                return positions.map((pos) => renderPizzaTopping(t, pos.x + offset, pos.y + offset));
              })}
            </g>
          )}

          {/* Draw Spices/Chillis around border if hot */}
          {isSpicy && (
            <g transform="translate(200, 200)">
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * (Math.PI / 180);
                const dist = crustRadius - 10;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                return (
                  <path key={`chili-${i}`} d={`M ${x} ${y} Q ${x + 8} ${y - 8} ${x + 12} ${y + 2} Q ${x + 4} ${y + 8} ${x} ${y}`} fill="#ff0000" transform={`rotate(${i * 45}, ${x}, ${y})`} />
                );
              })}
            </g>
          )}
        </g>
      </svg>
    );
  };

  const renderCupcake = () => {
    const frostingColor = getFill("frosting_color", "#ffb7c5");
    const toppingList = Array.isArray(selections["toppings"]) ? selections["toppings"] : (selections["toppings"] ? [selections["toppings"]] : []);

    const flavorSelection = (selections["flavor"] || selections["Base Flavor"] || "").toLowerCase();
    let baseColor = "#e6d5c3"; // vanilla/cream white
    if (flavorSelection.includes("chocolate")) baseColor = "#4b2e1b";
    else if (flavorSelection.includes("red velvet")) baseColor = "#8b0000";
    else if (flavorSelection.includes("strawberry")) baseColor = "#ffb7c5";
    else if (flavorSelection.includes("vanilla")) baseColor = "#fffdd0";

    const sizeSelection = (selections["size"] || "").toLowerCase();
    let scale = 1;
    if (sizeSelection.includes("mini") || sizeSelection.includes("small")) scale = 0.8;
    else if (sizeSelection.includes("jumbo") || sizeSelection.includes("large") || sizeSelection.includes("big")) scale = 1.3;

    const layerSelection = (selections["layers"] || selections["frosting_layers"] || selections["layer"] || "").toLowerCase();
    const isMultiLayer = layerSelection.includes("multi") || layerSelection.includes("double") || layerSelection.includes("extra");

    return (
      <svg viewBox="0 0 400 400" className="svg-cupcake">
        <g transform={`translate(200, 200) scale(${scale})`}>
          {/* Cupcake Wrapper */}
          <g transform="translate(0, 60)">
            <path d="M -60 -40 L -40 80 Q 0 90 40 80 L 60 -40 Z" fill={baseColor} stroke="#c4b5a2" strokeWidth="2" />
            <path d="M -50 -40 L -30 80 M -30 -40 L -10 85 M -10 -40 L 10 85 M 10 -40 L 30 80 M 30 -40 L 50 -40" fill="none" stroke="#d2b48c" strokeWidth="2" opacity="0.5" />
            <path d="M -40 80 Q 0 90 40 80 Q 0 95 -40 80 Z" fill="rgba(0,0,0,0.1)" />
          </g>

          {/* Frosting Swirl */}
          <g transform="translate(0, 30)">
            {isMultiLayer && (
              <g transform="translate(0, -35)">
                <path d="M -80 0 C -80 -60, 80 -60, 80 0 C 80 20, -80 20, -80 0" fill={frostingColor} stroke="rgba(0,0,0,0.05)" strokeWidth="2" />
              </g>
            )}
            <path d="M -70 0 C -70 -50, 70 -50, 70 0 C 70 20, -70 20, -70 0" fill={frostingColor} stroke="rgba(0,0,0,0.05)" strokeWidth="2" />
            <path d="M -50 -30 C -50 -70, 50 -70, 50 -30 C 50 -10, -50 -10, -50 -30" fill={frostingColor} stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
            <path d="M -25 -55 C -25 -90, 25 -90, 25 -55 C 25 -40, -25 -40, -25 -55" fill={frostingColor} stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
            <path d="M -40 -10 Q 0 -30 40 -10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
            <path d="M -20 -40 Q 0 -60 20 -40" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Toppings */}
          {toppingList.length > 0 ? (
            <g transform={`translate(0, ${isMultiLayer ? -55 : -20})`}>
              {toppingList.flatMap((t, tIdx) => {
                const offset = tIdx * 6;
                const positions = [
                  { x: -30, y: 10 }, { x: 30, y: 10 }, { x: -15, y: -10 }, { x: 15, y: -10 }, { x: 0, y: -30 }
                ];
                return positions.map((pos, pIdx) => renderTopping(t, pos.x + offset, pos.y - offset));
              })}
            </g>
          ) : (
            <circle cx="0" cy={isMultiLayer ? -80 : -60} r="14" fill="#ff4d4d" />
          )}
        </g>
      </svg>
    );
  };

  const renderBread = () => {
    // Determine Bake Level
    const bakeSelection = (selections["bake"] || selections["Bake Level"] || "").toLowerCase();
    let breadColor = "#d2b48c"; // default golden
    let strokeColor = "#8b4513";
    if (bakeSelection.includes("half")) { breadColor = "#F5DEB3"; strokeColor = "#d2b48c"; }
    else if (bakeSelection.includes("full")) { breadColor = "#D2691E"; strokeColor = "#8b4513"; }
    else if (bakeSelection.includes("extra") || bakeSelection.includes("crisp")) { breadColor = "#8B4513"; strokeColor = "#3d1e09"; }

    // Determine Shape
    const shapeSelection = (selections["shape"] || selections["Bread Shape"] || "").toLowerCase();
    const isBaguette = shapeSelection.includes("baguette");
    const isBoule = shapeSelection.includes("boule") || shapeSelection.includes("round");
    const isRolls = shapeSelection.includes("roll");

    // Determine Size
    const sizeSelection = (selections["size"] || selections["Loaf Size"] || "").toLowerCase();
    let scale = 1;
    if (sizeSelection.includes("small") || sizeSelection.includes("mini")) scale = 0.8;
    else if (sizeSelection.includes("large") || sizeSelection.includes("jumbo") || sizeSelection.includes("big")) scale = 1.2;

    // Determine Sliced
    const slicedSelection = (selections["sliced"] || selections["Sliced/Whole"] || "").toLowerCase();
    const isSliced = slicedSelection.includes("slice");

    // Determine Glaze
    const glazeSelection = (selections["glaze"] || "").toLowerCase();
    const hasGlaze = glazeSelection.includes("glaze") || glazeSelection.includes("egg");

    const toppingList = Array.isArray(selections["topping"]) ? selections["topping"] : (selections["topping"] ? [selections["topping"]] : []);
    const hasToppings = toppingList.length > 0;

    const renderBreadAddons = (x, y) => {
      return toppingList.flatMap((t, tIdx) => {
        const lower = t.toLowerCase();
        const offset = tIdx * 5;
        if (lower.includes("sesame")) {
          return <ellipse key={`${t}-${x}-${y}`} cx={x + offset} cy={y + offset} rx="2" ry="3" fill="#FFFDD0" transform={`rotate(${(x * 13) % 360}, ${x + offset}, ${y + offset})`} />;
        }
        if (lower.includes("herb") || lower.includes("rosemary") || lower.includes("thyme")) {
          return <path key={`${t}-${x}-${y}`} d={`M ${x + offset} ${y + offset} L ${x + offset + 4} ${y + offset - 2}`} stroke="#2e8b57" strokeWidth="2" strokeLinecap="round" transform={`rotate(${(x * 7) % 360}, ${x + offset}, ${y + offset})`} />;
        }
        if (lower.includes("sunflower") || lower.includes("pumpkin")) {
          return <ellipse key={`${t}-${x}-${y}`} cx={x + offset} cy={y + offset} rx="4" ry="2" fill="#556b2f" transform={`rotate(${(y * 11) % 360}, ${x + offset}, ${y + offset})`} />;
        }
        return <circle key={`${t}-${x}-${y}`} cx={x + offset} cy={y + offset} r="2" fill="#333" />;
      });
    };

    const getAddonPositions = (type) => {
      let pos = [];
      if (type === "baguette") {
        for (let i = -120; i <= 120; i += 30) { pos.push({ x: i, y: -10 }, { x: i + 15, y: 10 }); }
      } else if (type === "boule") {
        for (let i = 0; i < 360; i += 45) { pos.push({ x: Math.cos(i) * 50, y: Math.sin(i) * 50 }, { x: Math.cos(i + 20) * 80, y: Math.sin(i + 20) * 80 }); }
      } else if (type === "rolls") {
        // handled per roll
      } else if (type === "slice") {
        for (let x = -30; x <= 30; x += 30) { pos.push({ x, y: -20 }, { x: x + 15, y: 10 }, { x: x - 10, y: 40 }); }
      } else {
        for (let x = -80; x <= 80; x += 40) { pos.push({ x, y: -30 }, { x: x + 20, y: 0 }, { x, y: 30 }); }
      }
      return pos;
    };

    return (
      <svg viewBox="0 0 400 400" className="svg-bread">
        <g transform={`translate(200, 200) scale(${scale})`}>
          {isSliced ? (
            <g>
              <path d="M -60 20 Q -60 -70 0 -90 Q 60 -70 60 20 L 50 80 Q 0 100 -50 80 Z" fill={breadColor} stroke={strokeColor} strokeWidth="6" />
              <path d="M -50 20 Q -50 -60 0 -80 Q 50 -60 50 20 L 40 75 Q 0 90 -40 75 Z" fill="#fff5e6" />
              {hasToppings && <g>{getAddonPositions("slice").map(p => renderBreadAddons(p.x, p.y))}</g>}
            </g>
          ) : isBaguette ? (
            <g>
              <ellipse cx="0" cy="0" rx="170" ry="50" fill={breadColor} stroke={strokeColor} strokeWidth="3" transform="rotate(-30)" />
              <path d="M -90 -20 Q -60 -40 -30 -10" fill="none" stroke={strokeColor} strokeWidth="4" opacity="0.6" transform="rotate(-30)" />
              <path d="M -20 10 Q 10 -10 40 20" fill="none" stroke={strokeColor} strokeWidth="4" opacity="0.6" transform="rotate(-30)" />
              <path d="M 50 40 Q 80 20 110 50" fill="none" stroke={strokeColor} strokeWidth="4" opacity="0.6" transform="rotate(-30)" />
              {hasGlaze && <path d="M -120 -60 Q 0 -90 120 -10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="6" strokeLinecap="round" transform="rotate(-30)" />}
              {hasToppings && <g transform="rotate(-30)">{getAddonPositions("baguette").map(p => renderBreadAddons(p.x, p.y))}</g>}
            </g>
          ) : isBoule ? (
            <g>
              <circle cx="0" cy="0" r="130" fill={breadColor} stroke={strokeColor} strokeWidth="3" />
              <path d="M -80 -80 L 80 80" fill="none" stroke={strokeColor} strokeWidth="6" opacity="0.6" />
              <path d="M -80 80 L 80 -80" fill="none" stroke={strokeColor} strokeWidth="6" opacity="0.6" />
              {hasGlaze && <path d="M -60 -90 A 100 100 0 0 1 60 -90" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="8" strokeLinecap="round" />}
              {hasToppings && <g>{getAddonPositions("boule").map(p => renderBreadAddons(p.x, p.y))}</g>}
            </g>
          ) : isRolls ? (
            <g>
              {[{ cx: -60, cy: -60 }, { cx: 60, cy: -60 }, { cx: -60, cy: 60 }, { cx: 60, cy: 60 }].map((roll, i) => (
                <g key={i}>
                  <circle cx={roll.cx} cy={roll.cy} r="55" fill={breadColor} stroke={strokeColor} strokeWidth="2" />
                  <path d={`M ${roll.cx - 20} ${roll.cy} Q ${roll.cx} ${roll.cy - 15} ${roll.cx + 20} ${roll.cy}`} fill="none" stroke={strokeColor} strokeWidth="3" opacity="0.6" />
                  {hasGlaze && <path d={`M ${roll.cx - 20} ${roll.cy - 30} Q ${roll.cx} ${roll.cy - 40} ${roll.cx + 20} ${roll.cy - 30}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />}
                  {hasToppings && <g>{[{ x: roll.cx - 15, y: roll.cy - 10 }, { x: roll.cx + 15, y: roll.cy - 10 }, { x: roll.cx, y: roll.cy + 15 }].map(p => renderBreadAddons(p.x, p.y))}</g>}
                </g>
              ))}
            </g>
          ) : (
            <g>
              {/* Classic Loaf */}
              <ellipse cx="0" cy="0" rx="140" ry="90" fill={breadColor} stroke={strokeColor} strokeWidth="3" />
              <path d="M -80 -20 Q 0 -80 80 -20" fill="none" stroke={strokeColor} strokeWidth="4" opacity="0.6" />
              <path d="M -60 20 Q 0 -40 60 20" fill="none" stroke={strokeColor} strokeWidth="4" opacity="0.6" />
              <path d="M -40 60 Q 0 0 40 60" fill="none" stroke={strokeColor} strokeWidth="4" opacity="0.6" />
              {hasGlaze && <path d="M -100 -50 Q 0 -110 100 -50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="8" strokeLinecap="round" />}
              {hasToppings && <g>{getAddonPositions("classic").map(p => renderBreadAddons(p.x, p.y))}</g>}
            </g>
          )}
        </g>
      </svg>
    );
  };

  const renderPlaceholder = () => (
    <div className="svg-placeholder" style={{ borderRadius: '12px', overflow: 'hidden', width: '100%', height: '100%' }}>
      <img
        src={product?.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80"}
        alt={product?.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );

  let content;
  switch (type?.toUpperCase()) {
    case "CAKE": content = renderCake(); break;
    case "PIZZA": content = renderPizza(); break;
    case "CUPCAKE": content = renderCupcake(); break;
    case "BREAD": content = renderBread(); break;
    default: content = renderPlaceholder();
  }

  return (
    <div className="customizer-svg-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      {content}
    </div>
  );
}
