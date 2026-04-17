import React from "react";
import { useApp } from "../../context/AppContext";

export function StepCard({ num, title, subtitle, isOpen, toggleOpen, children }) {
  return (
    <div className={`step-card ${isOpen ? "open" : ""}`}>
      <div className="step-header" onClick={toggleOpen}>
        <div className="step-num">{num}</div>
        <div>
          <div className="step-title">{title}</div>
          <div className="step-subtitle">{subtitle}</div>
        </div>
        <div className="step-chevron">▾</div>
      </div>
      <div className="step-body">{children}</div>
    </div>
  );
}

export function SizeStep() {
  const { state, updateState } = useApp();
  
  const options = [
    { name: 'Small 6"', serves: "Serves 4–6", price: 600 },
    { name: 'Medium 8"', serves: "Serves 8–10", price: 850 },
    { name: 'Large 10"', serves: "Serves 12–15", price: 1100, outOfStock: true },
    { name: "Sheet Cake", serves: "Serves 20+", price: 1400 }
  ];

  return (
    <div className="size-grid">
      {options.map((opt) => (
        <div
          key={opt.name}
          className={`opt-card ${state.size.name === opt.name ? "selected" : ""} ${opt.outOfStock ? "out-of-stock" : ""}`}
          onClick={() => !opt.outOfStock && updateState("size", { name: opt.name, price: opt.price })}
          style={opt.outOfStock ? { position: "relative" } : {}}
        >
          <div className="opt-card-icon">🎂</div>
          <div className="opt-card-name">{opt.name}</div>
          <div className="opt-card-serves">{opt.serves}</div>
          <div className="opt-card-price">Rs {opt.price.toLocaleString()}</div>
          {opt.outOfStock && <div className="opt-oos-badge">Out of Stock</div>}
        </div>
      ))}
    </div>
  );
}

export function LayersStep() {
  const { state, updateState } = useApp();
  const options = [
    { count: 1, extra: 0, label: "1 Layer", priceLabel: "Included" },
    { count: 2, extra: 150, label: "2 Layers", priceLabel: "+Rs 150" },
    { count: 3, extra: 280, label: "3 Layers", priceLabel: "+Rs 280" }
  ];

  return (
    <div className="layer-opts">
      {options.map((opt) => (
        <div
          key={opt.count}
          className={`layer-btn ${state.layers.count === opt.count ? "selected" : ""}`}
          onClick={() => updateState("layers", { count: opt.count, extra: opt.extra })}
        >
          <div className="layer-btn-label">{opt.label}</div>
          <div className="layer-btn-price">{opt.priceLabel}</div>
        </div>
      ))}
    </div>
  );
}

export function FrostingStep() {
  const { state, updateState } = useApp();
  const flavors = [
    { flavor: "Vanilla", price: 0, label: "Vanilla (base)" },
    { flavor: "Chocolate", price: 80, label: "Chocolate +Rs 80" },
    { flavor: "Strawberry", price: 100, label: "Strawberry +Rs 100" },
    { flavor: "Lemon", price: 90, label: "Lemon +Rs 90" },
    { flavor: "Cream Cheese", price: 120, label: "Cream Cheese +Rs 120", oos: true }
  ];
  const colors = [
    { name: "Cream", hex: "#fff5ec" }, { name: "Blush Pink", hex: "#f2c4b0" },
    { name: "Baby Blue", hex: "#c8dff0" }, { name: "Mint", hex: "#b8d8b9" },
    { name: "Lavender", hex: "#d4b8e0" }, { name: "Peach", hex: "#f5cba7" },
    { name: "Coral", hex: "#f1948a" }
  ];

  return (
    <>
      <div className="frost-label">Flavor</div>
      <div className="frost-flavors">
        {flavors.map(f => (
          <button
            key={f.flavor}
            className={`frost-btn ${state.frost.flavor === f.flavor ? "selected" : ""} ${f.oos ? "oos" : ""}`}
            onClick={() => !f.oos && updateState("frost", { flavor: f.flavor, price: f.price })}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="frost-label" style={{ marginTop: "16px" }}>Frosting Color</div>
      <div className="color-swatches" style={{ marginTop: "10px" }}>
        {colors.map(c => (
          <div className="swatch-wrap" key={c.name}>
            <div
              className={`color-swatch ${state.frostColor === c.name ? "selected" : ""}`}
              style={{ background: c.hex }}
              onClick={() => updateState("frostColor", c.name)}
            ></div>
            <div className="color-swatch-label">{c.name.split(" ")[0]}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function ToppingsStep() {
  const { state, updateState } = useApp();
  const options = [
    { name: "Sprinkles", icon: "🌈", price: 60 },
    { name: "Fresh Fruits", icon: "🍓", price: 150 },
    { name: "Choco Shavings", icon: "🍫", price: 120 },
    { name: "Edible Glitter", icon: "✨", price: 80 },
    { name: "Fondant Flowers", icon: "🌸", price: 200 },
    { name: "Sugar Pearls", icon: "🫧", price: 100, oos: true },
  ];

  const toggles = (name, price) => {
    let ts = [...state.toppings];
    const idx = ts.findIndex(t => t.name === name);
    if (idx >= 0) ts.splice(idx, 1);
    else ts.push({ name, price });
    updateState("toppings", ts);
  };

  return (
    <div className="toppings-grid">
      {options.map(o => {
        const isSelected = state.toppings.some(t => t.name === o.name);
        return (
          <div
            key={o.name}
            className={`topping-card ${isSelected ? "selected" : ""} ${o.oos ? "out-of-stock" : ""}`}
            onClick={() => !o.oos && toggles(o.name, o.price)}
          >
            {isSelected && <div className="check">✓</div>}
            <div className="topping-icon">{o.icon}</div>
            <div className="topping-name">{o.name}</div>
            <div className="topping-price" style={o.oos ? { color: "var(--ink-muted)" } : {}}>
              {o.oos ? "Out of Stock" : `+Rs ${o.price}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MessageStep() {
  const { state, updateState } = useApp();
  const fonts = [
    { id: "cursive", label: "Cursive Script", ff: "Cormorant Garamond, serif", fs: "italic" },
    { id: "serif", label: "Elegant Serif", ff: "Cormorant Garamond, serif", fs: "normal" },
    { id: "sans", label: "Clean Print", ff: "Jost, sans-serif", fs: "normal", size: "13px" },
  ];

  return (
    <>
      <textarea
        className="msg-input"
        rows="2"
        maxLength="30"
        placeholder="e.g. Happy Birthday Sarah!"
        value={state.message}
        onChange={e => updateState("message", e.target.value)}
      ></textarea>
      <div className="msg-counter"><span>{state.message.length}</span>/30</div>
      <div className="font-previews">
        {fonts.map(f => (
          <div
            key={f.id}
            className={`font-preview ${state.font === f.id ? "selected" : ""}`}
            onClick={() => updateState("font", f.id)}
          >
            <div
              className="font-preview-text"
              style={{ fontFamily: f.ff, fontStyle: f.fs, fontSize: f.size || "inherit" }}
            >
              Happy Birthday
            </div>
            <div className="font-preview-label">{f.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function DecorationsStep() {
  const { state, updateState } = useApp();
  const options = [
    { name: "Birthday Candles", icon: "🕯️", price: 80 },
    { name: "Sparkler", icon: "✨", price: 120 },
    { name: "Ribbon Border", icon: "🎀", price: 60 }
  ];

  const toggles = (name, price) => {
    let ds = [...state.decos];
    const idx = ds.findIndex(d => d.name === name);
    if (idx >= 0) ds.splice(idx, 1);
    else ds.push({ name, price });
    updateState("decos", ds);
  };

  const handleCandle = (delta, e) => {
    e.stopPropagation();
    let num = Math.max(1, Math.min(9, state.numCandle + delta));
    let ds = [...state.decos];
    const idx = ds.findIndex(d => d.name === "Number Candle");
    
    // Auto toggle on if interacting
    if (idx >= 0) {
      ds[idx].price = 100 * num;
    } else {
      ds.push({ name: "Number Candle", price: 100 * num });
    }
    
    updateState("numCandle", num);
    updateState("decos", ds);
  };

  return (
    <div className="deco-grid">
      {options.map(o => (
        <div
          key={o.name}
          className={`deco-item ${state.decos.some(d => d.name === o.name) ? "selected" : ""}`}
          onClick={() => toggles(o.name, o.price)}
        >
          <div className="deco-emoji">{o.icon}</div>
          <div>
            <div className="deco-name">{o.name}</div>
            <div className="deco-price">+Rs {o.price}</div>
          </div>
        </div>
      ))}
      <div 
        className={`deco-item ${state.decos.some(d => d.name === "Number Candle") ? "selected" : ""}`}
        onClick={() => toggles("Number Candle", 100 * state.numCandle)}
      >
        <div className="deco-emoji">🔢</div>
        <div>
          <div className="deco-name">Number Candle</div>
          <div className="deco-price">+Rs 100 each</div>
        </div>
        <div className="deco-qty">
          <button className="qty-btn" onClick={(e) => handleCandle(-1, e)}>−</button>
          <span className="qty-num">{state.numCandle}</span>
          <button className="qty-btn" onClick={(e) => handleCandle(1, e)}>+</button>
        </div>
      </div>
    </div>
  );
}
