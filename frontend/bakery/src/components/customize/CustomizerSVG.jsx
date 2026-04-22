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
          <rect x={x+8} y={y+2} width="2" height="6" fill="#98FF98" transform={`rotate(${(x+45) % 360})`} />
          <rect x={x-8} y={y-2} width="2" height="6" fill="#FFF44F" transform={`rotate(${(x+90) % 360})`} />
        </g>
      );
    }
    if (lower.includes("chocolate") || lower.includes("shaving")) {
      return (
        <path 
            key={`${name}-${x}-${y}`}
            d={`M ${x} ${y} Q ${x+4} ${y-4} ${x+8} ${y} Q ${x+4} ${y+4} ${x} ${y}`} 
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
          for(let j=0; j<i; j++) currentY -= tierHeights[j];
          currentY -= h;

          return (
            <g key={i}>
              <rect x={x} y={currentY} width={w} height={h} fill={frostingColor} stroke="rgba(0,0,0,0.05)" />
              <rect x={x} y={currentY} width={w} height={6} fill="rgba(255,255,255,0.3)" />
              <path 
                d={`M ${x} ${currentY + 6} Q ${x + w/4} ${currentY + 12} ${x + w/2} ${currentY + 6} Q ${x + 3*w/4} ${currentY + 12} ${x + w} ${currentY + 6}`} 
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
                        {x: -30, y: -5}, {x: 0, y: -10}, {x: 30, y: -5},
                        {x: -15, y: -2}, {x: 15, y: -2}, {x: 0, y: 0}
                    ];
                    return positions.map((pos, pIdx) => renderTopping(t, pos.x + (tIdx * 2), pos.y - (tIdx * 2)));
                })}
            </g>
        )}
      </svg>
    );
  };

  const renderPizza = () => {
    const crustColor = getFill("crust", "#d2b48c");
    const sauceColor = getFill("sauce", "#e31837");
    const cheeseColor = getFill("cheese", "#ffef00");
    const toppingList = Array.isArray(selections["toppings"]) ? selections["toppings"] : (selections["toppings"] ? [selections["toppings"]] : []);
    
    return (
      <svg viewBox="0 0 400 400" className="svg-pizza">
        <circle cx="200" cy="200" r="160" fill={crustColor} stroke="#8b4513" strokeWidth="4" />
        <circle cx="200" cy="200" r="135" fill={sauceColor} />
        <circle cx="200" cy="200" r="125" fill={cheeseColor} opacity="0.95" />
        
        {toppingList.length > 0 && (
          <g transform="translate(200, 200)">
            {toppingList.flatMap((t, tIdx) => {
                const positions = [
                    {x: -50, y: -50}, {x: 50, y: -50}, {x: -50, y: 50}, {x: 50, y: 50},
                    {x: 0, y: -70}, {x: 0, y: 70}, {x: -70, y: 0}, {x: 70, y: 0}
                ];
                return positions.map((pos, pIdx) => renderTopping(t, pos.x, pos.y));
            })}
          </g>
        )}
      </svg>
    );
  };

  const renderCupcake = () => {
    const frostingColor = getFill("frosting_color", "#ffb7c5");
    const toppingList = Array.isArray(selections["toppings"]) ? selections["toppings"] : (selections["toppings"] ? [selections["toppings"]] : []);

    return (
      <svg viewBox="0 0 400 400" className="svg-cupcake">
        <path d="M 140 320 L 120 220 L 280 220 L 260 320 Z" fill="#f0e6d2" stroke="#d2b48c" strokeWidth="2" />
        <path d="M 120 220 C 120 120, 280 120, 280 220" fill={frostingColor} stroke="rgba(0,0,0,0.05)" />
        <path d="M 160 160 Q 200 140 240 160" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
        <path d="M 140 200 Q 200 180 260 200" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
        
        {toppingList.length > 0 ? (
          <g transform="translate(200, 180)">
             {toppingList.flatMap((t, tIdx) => {
                const positions = [{x: -20, y: -20}, {x: 20, y: -20}, {x: 0, y: -40}];
                return positions.map((pos, pIdx) => renderTopping(t, pos.x, pos.y));
             })}
          </g>
        ) : (
          <circle cx="200" cy="140" r="12" fill="#ff4d4d" />
        )}
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
    default: content = renderPlaceholder();
  }

  return (
    <div className="customizer-svg-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
        {content}
    </div>
  );
}
