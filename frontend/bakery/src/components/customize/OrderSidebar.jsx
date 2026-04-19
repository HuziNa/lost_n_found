import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "./Icons";

const COLOR_MAP = {
  Cream: "#FFF5EC",
  "Blush Pink": "#F2C4B0",
  "Baby Blue": "#C8DFF0",
  Mint: "#B8D8B9",
  Lavender: "#D4B8E0",
  Peach: "#F5CBA7",
  Coral: "#F1948A",
};

const PRODUCT_TOPPINGS = {
  cake: ["Sprinkles", "Fresh Fruits", "Choco Shavings", "Edible Glitter", "Fondant Flowers", "Sugar Pearls"],
  pizza: ["Pepperoni", "Mushrooms", "Black Olives", "Bell Peppers", "Red Onions", "Jalapenos"],
  cupcake: ["Rainbow Sprinkles", "Fruit Compote", "Chocolate Drizzle", "Edible Glitter", "Mini Macarons"]
};

export default function OrderSidebar() {
  const { state, calcTotal, applyVoucher, addToCart } = useApp();
  const { user, openAuthModal } = useAuth();
  const isRestricted = user?.role === "admin" || user?.role === "owner";
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherMsg, setVoucherMsg] = useState("");
  const [voucherType, setVoucherType] = useState("");

  // Determine product type from selected toppings
  const determineProductType = () => {
    const selectedToppingNames = state.toppings.map(t => t.name);
    
    if (selectedToppingNames.some(name => PRODUCT_TOPPINGS.pizza.includes(name))) {
      return "pizza";
    }
    if (selectedToppingNames.some(name => PRODUCT_TOPPINGS.cupcake.includes(name))) {
      return "cupcake";
    }
    return "cake";
  };

  const productType = determineProductType();
  const color = COLOR_MAP[state.frostColor] || "#FFF5EC";

  const renderCakePreview = () => {
    const tierCount = state.layers.count;
    const heights = tierCount === 1 ? [120] : tierCount === 2 ? [104, 92] : [88, 80, 72];
    const widths = tierCount === 1 ? [320] : tierCount === 2 ? [320, 240] : [320, 250, 180];

    let y = 290;
    const tiers = [];
    for (let i = 0; i < tierCount; i++) {
      const w = widths[i];
      const h = heights[i];
      const x = 200 - w / 2;
      y -= h;
      tiers.push(
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} rx="9" fill={color} stroke="rgba(28,20,16,0.08)" strokeWidth="1" />
          <rect x={x} y={y} width={w} height="13" rx="7" fill="rgba(255,255,255,0.65)" />
        </g>
      );
    }

    const topTierY = y;
    const toppings = [];
    state.toppings.forEach((topping, index) => {
      const name = topping.name.toLowerCase();
      if (name.includes('sprinkle')) {
        for (let j = 0; j < 8; j++) {
          const x = 120 + Math.random() * 160;
          const ty = topTierY - 9 + Math.random() * 18;
          toppings.push(<rect key={`sprinkle-${index}-${j}`} x={x} y={ty} width="4" height="4" fill="#F7D76A" />);
        }
      } else if (name.includes('fruit')) {
        const x = 160 + index * 29;
        const ty = topTierY - 5;
        toppings.push(<circle key={`fruit-${index}-red`} cx={x} cy={ty} r="5" fill="#E84F64" />);
        toppings.push(<circle key={`fruit-${index}-blue`} cx={x+16} cy={ty} r="5" fill="#4169E1" />);
      } else if (name.includes('choco')) {
        const x = 140 + index * 24;
        const ty = topTierY - 9;
        toppings.push(<path key={`choco-${index}`} d={`M${x},${ty} Q${x+8},${ty-4} ${x+16},${ty}`} stroke="#7A4B36" strokeWidth="3" fill="none" />);
      } else if (name.includes('glitter')) {
        const x = 180 + index * 20;
        const ty = topTierY - 8;
        toppings.push(<polygon key={`glitter-${index}`} points={`${x},${ty-5} ${x+3},${ty} ${x+6},${ty-5} ${x+3},${ty+3}`} fill="#D8C4E5" />);
      } else if (name.includes('flower')) {
        const x = 200 + index * 28;
        const ty = topTierY - 12;
        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2;
          const px = x + Math.cos(angle) * 4;
          const py = ty + Math.sin(angle) * 4;
          toppings.push(<circle key={`petal-${index}-${p}`} cx={px} cy={py} r="2" fill="#FFB6C1" />);
        }
      } else if (name.includes('pearl')) {
        const x = 170 + index * 32;
        const ty = topTierY - 4;
        toppings.push(<circle key={`pearl-${index}`} cx={x} cy={ty} r="5" fill="white" stroke="#E0E0E0" strokeWidth="1" />);
      }
    });

    const decorations = [];
    state.decos.forEach((deco, index) => {
      const name = deco.name.toLowerCase();
      if (name.includes('birthday candles')) {
        for (let c = 0; c < 3; c++) {
          const x = 170 + c * 29;
          decorations.push(<rect key={`candle-${c}`} x={x} y={topTierY - 40} width="4" height="29" fill="#F5DEB3" />);
          decorations.push(<polygon key={`flame-${c}`} points={`${x},${topTierY-40} ${x+2},${topTierY-46} ${x+4},${topTierY-40}`} fill="#FFD700" />);
        }
      } else if (name.includes('sparkler')) {
        decorations.push(<rect x="260" y={topTierY - 29} width="2" height="20" fill="#C0C0C0" />);
        for (let d = 0; d < 5; d++) {
          const dx = 250 + Math.random() * 20;
          const dy = topTierY - 40 + Math.random() * 16;
          decorations.push(<circle key={`spark-${d}`} cx={dx} cy={dy} r="1.6" fill="#FFD700" />);
        }
      } else if (name.includes('ribbon')) {
        decorations.push(<rect x="100" y="290" width="200" height="4" fill="#FF69B4" />);
      } else if (name.includes('number candle')) {
        decorations.push(<rect x="280" y={topTierY - 49} width="5" height="36" fill="#F5DEB3" />);
        decorations.push(<text x="282.5" y={topTierY - 20} textAnchor="middle" fontSize="12" fill="#000">{state.numCandle || '1'}</text>);
      }
    });

    const ff = state.font === "cursive" ? "Cormorant Garamond,serif" : state.font === "serif" ? "Georgia,serif" : "Jost,sans-serif";
    const fs = state.font === "cursive" ? "italic" : "normal";

    return (
      <svg viewBox="0 0 400 350" width="340" height="300" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="200" cy="330" rx="160" ry="15" fill="rgba(28,20,16,0.08)" />
        <ellipse cx="200" cy="320" rx="156" ry="13" fill="#C9B49A" />
        <ellipse cx="200" cy="315" rx="152" ry="11" fill="#E8D5C0" />
        {tiers}
        {toppings}
        {decorations}
        {state.message && (
          <text x="200" y={topTierY + heights[0] - 24} textAnchor="middle" fontSize="17" fill="#1C1410" fontFamily={ff} fontStyle={fs}>
            {state.message.substring(0, 30)}
          </text>
        )}
      </svg>
    );
  };

  const renderCupcakePreview = () => {
    const quantity = state.quantity || 1;
    const cupcakes = [];

    for (let q = 0; q < Math.min(quantity, 3); q++) { // Show max 3 in preview
      const offsetX = q * 100 - (Math.min(quantity, 3) - 1) * 50;
      const baseX = 200 + offsetX;

      // Base trapezoid
      cupcakes.push(
        <polygon key={`base-${q}`} points={`${baseX-29},310 ${baseX+29},310 ${baseX+24},270 ${baseX-24},270`} fill="#B8765A" />
      );

      // Wrapper lines
      for (let l = 0; l < 3; l++) {
        const lx = baseX - 20 + l * 13;
        cupcakes.push(<line key={`line-${q}-${l}`} x1={lx} y1="270" x2={lx} y2="310" stroke="#9A5846" strokeWidth="2" />);
      }

      // Frosting swirl
      const frostColor = COLOR_MAP[state.frostColor] || '#F3C1D4';
      cupcakes.push(
        <path key={`frost-${q}`} d={`M${baseX-40},260 Q${baseX-13},245 ${baseX},252 Q${baseX+13},245 ${baseX+40},260`} stroke={frostColor} strokeWidth="12" fill="none" />
      );

      // Toppings on frosting
      state.toppings.forEach((topping, index) => {
        const name = topping.name.toLowerCase();
        const tx = baseX - 29 + index * 16;
        const ty = 248 + Math.sin(index) * 5;

        if (name.includes('sprinkle')) {
          cupcakes.push(<circle key={`sprinkle-${q}-${index}`} cx={tx} cy={ty} r="2" fill="#F7D76A" />);
        } else if (name.includes('fruit')) {
          cupcakes.push(<circle key={`fruit-${q}-${index}`} cx={tx} cy={ty} r="3" fill="#E84F64" />);
        } else if (name.includes('glitter')) {
          cupcakes.push(<polygon key={`glitter-${q}-${index}`} points={`${tx},${ty-3} ${tx+1.6},${ty} ${tx+3.2},${ty-3} ${tx+1.6},${ty+1.6}`} fill="#D8C4E5" />);
        } else if (name.includes('macaron')) {
          for (let p = 0; p < 3; p++) {
            const angle = (p / 3) * Math.PI * 2;
            const px = tx + Math.cos(angle) * 3;
            const py = ty + Math.sin(angle) * 3;
            cupcakes.push(<circle key={`macaron-${q}-${index}-${p}`} cx={px} cy={py} r="1.3" fill="#FFB6C1" />);
          }
        }
      });
    }

    return (
      <svg viewBox="0 0 400 350" width="340" height="300" xmlns="http://www.w3.org/2000/svg">
        {cupcakes}
      </svg>
    );
  };

  const renderPizzaPreview = () => {
    const sauceColors = {
      Marinara: '#DC143C',
      Pesto: '#228B22',
      White: '#FFFACD',
      BBQ: '#8B4513'
    };
    const sauceColor = sauceColors[state.sauce?.type] || '#DC143C';

    const toppings = [];
    state.toppings.forEach((topping, index) => {
      const name = topping.name.toLowerCase();
      const angle = (index / Math.max(state.toppings.length, 1)) * Math.PI * 2;
      const radius = 90;
      const x = 200 + Math.cos(angle) * radius;
      const y = 175 + Math.sin(angle) * radius * 0.7;

      if (name.includes('pepperoni')) {
        toppings.push(<circle key={`pepperoni-${index}`} cx={x} cy={y} r="8" fill="#D9473C" />);
      } else if (name.includes('mushroom')) {
        toppings.push(<ellipse key={`mushroom-${index}`} cx={x} cy={y} rx="6" ry="5" fill="#B99E87" />);
        toppings.push(<rect key={`stem-${index}`} x={x-1} y={y+3} width="2" height="4" fill="#8B7355" />);
      } else if (name.includes('olive')) {
        toppings.push(<ellipse key={`olive-${index}`} cx={x} cy={y} rx="5" ry="8" fill="#2F4F2F" />);
      } else if (name.includes('bell')) {
        toppings.push(<rect key={`pepper-${index}`} x={x-4} y={y-3} width="8" height="6" fill="#32CD32" rx="1" />);
      } else if (name.includes('onion')) {
        toppings.push(<circle key={`onion-${index}`} cx={x} cy={y} r="6" fill="none" stroke="#F5F5F5" strokeWidth="3" />);
      } else if (name.includes('jalapeno')) {
        toppings.push(<path key={`jalapeno-${index}`} d={`M${x-4},${y} Q${x},${y-4} ${x+4},${y}`} stroke="#228B22" strokeWidth="3" fill="none" />);
      }
    });

    return (
      <svg viewBox="0 0 400 350" width="340" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="crustGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0B16B" />
            <stop offset="100%" stopColor="#B58142" />
          </radialGradient>
        </defs>
        {/* Crust */}
        <circle cx="200" cy="175" r="120" fill="url(#crustGradient)" />
        {/* Sauce */}
        <circle cx="200" cy="175" r="104" fill={sauceColor} />
        {/* Cheese */}
        <circle cx="200" cy="175" r="96" fill="#F4E389" />
        {toppings}
      </svg>
    );
  };

  const renderPreview = () => {
    switch (productType) {
      case 'cake':
        return renderCakePreview();
      case 'cupcake':
        return renderCupcakePreview();
      case 'pizza':
        return renderPizzaPreview();
      default:
        return renderCakePreview();
    }
  };

  const { discountAmt, total } = calcTotal();
  const toppingTotal = state.toppings.reduce((s, t) => s + t.price, 0);
  const decoTotal = state.decos.reduce((s, d) => s + d.price, 0);

  const handleVoucher = () => {
    const { message, type } = applyVoucher(voucherInput);
    setVoucherMsg(message);
    setVoucherType(type);
  };

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (isRestricted) {
      alert("Admins and bakery owners cannot place orders.");
      return;
    }

    const productNames = {
      cake: "Custom Cake",
      cupcake: "Custom Cupcakes", 
      pizza: "Custom Pizza"
    };

    addToCart({
      name: productNames[productType] || "Custom Cake",
      detail: `${state.frost?.flavor || 'Standard'} · ${state.frostColor} · ${state.toppings.length ? state.toppings.map(t => t.name).join(", ") : "No toppings"}${state.decos.length ? " · " + state.decos.map(d => d.name).join(", ") : ""}`,
      price: total,
      icon: productType
    });
  };

  const saveDesign = () => alert("Design saved. Share link copied to clipboard.");

  return (
    <div className="order-sidebar" style={{ position: "sticky", top: "120px" }}>
      <div className="order-card">
        <div className="order-card-header">
          <Icon name="sparkle" className="order-card-icon" />
          <div className="order-card-title">Your Bespoke {productType.charAt(0).toUpperCase() + productType.slice(1)}</div>
        </div>

        <div className="order-preview" id="cake-preview-area">
          {renderPreview()}
        </div>

        <div className="order-lines">
          <div className="order-line">
            <span>Base {productType} ({state.size?.name || 'Standard'})</span>
            <span>Rs {state.size?.price?.toLocaleString() || '850'}</span>
          </div>
          {productType === 'cake' && (
            <div className="order-line">
              <span>+ {state.layers?.count || 2} Layer{state.layers?.count > 1 ? "s" : ""}</span>
              <span>{state.layers?.extra ? `Rs ${state.layers.extra}` : "Included"}</span>
            </div>
          )}
          <div className="order-line">
            <span>+ {state.frost.flavor} frosting</span>
            <span>{state.frost.price ? `Rs ${state.frost.price}` : "Included"}</span>
          </div>
          <div className="order-line">
            <span>+ Toppings ({state.toppings.length})</span>
            <span>Rs {toppingTotal}</span>
          </div>
          {state.message && (
            <div className="order-line">
              <span>+ Message</span>
              <span>Rs 0</span>
            </div>
          )}
          <div className="order-line">
            <span>+ Decorations ({state.decos.length})</span>
            <span>Rs {decoTotal}</span>
          </div>
          {discountAmt > 0 && (
            <div className="order-line">
              <span style={{ color: "var(--sage-dark)" }}>Voucher ({state.voucherCode} -{state.discount}%)</span>
              <span style={{ color: "var(--sage-dark)" }}>−Rs {discountAmt}</span>
            </div>
          )}
          <div className="order-line total">
            <span>Total</span>
            <span>Rs {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="voucher-row">
          <input
            className="voucher-input"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
            type="text"
            placeholder="Voucher code"
            maxLength="12"
          />
          <button className="voucher-btn" onClick={handleVoucher}>Apply</button>
        </div>
        {voucherMsg && <div className={`voucher-msg ${voucherType}`}>{voucherMsg}</div>}

        <div className="order-actions">
          <button className="btn-outline" onClick={saveDesign}>
            <Icon name="heart" className="btn-icon" />
            Save Design
          </button>
          <button className="btn-sage" onClick={handleAddToCart}>
            <Icon name="cart" className="btn-icon" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
