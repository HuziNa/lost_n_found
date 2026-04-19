import React from "react";
import { useApp } from "../../context/AppContext";
import { Icon } from "./Icons";

const PRODUCT_TOPPINGS = {
  cake: [
    { name: "Sprinkles", icon: "sprinkles", price: 60, ingredientId: "507f191e810c19729de86001" },
    { name: "Fresh Fruits", icon: "fruit", price: 150, ingredientId: "507f191e810c19729de86002" },
    { name: "Choco Shavings", icon: "chocolate", price: 120, ingredientId: "507f191e810c19729de86003" },
    { name: "Edible Glitter", icon: "glitter", price: 80, ingredientId: "507f191e810c19729de86004" },
    { name: "Fondant Flowers", icon: "flower", price: 200, ingredientId: "507f191e810c19729de86005" },
    { name: "Sugar Pearls", icon: "pearl", price: 100, ingredientId: "507f191e810c19729de86006" }
  ],
  pizza: [
    { name: "Pepperoni", icon: "pepper", price: 90, ingredientId: "507f191e810c19729de86101" },
    { name: "Mushrooms", icon: "mushroom", price: 70, ingredientId: "507f191e810c19729de86102" },
    { name: "Black Olives", icon: "olive", price: 60, ingredientId: "507f191e810c19729de86103" },
    { name: "Bell Peppers", icon: "leaf", price: 50, ingredientId: "507f191e810c19729de86104" },
    { name: "Red Onions", icon: "onion", price: 50, ingredientId: "507f191e810c19729de86105" },
    { name: "Jalapenos", icon: "chili", price: 80, ingredientId: "507f191e810c19729de86106" }
  ],
  cupcake: [
    { name: "Rainbow Sprinkles", icon: "sprinkles", price: 40, ingredientId: "507f191e810c19729de86201" },
    { name: "Fruit Compote", icon: "fruit", price: 80, ingredientId: "507f191e810c19729de86202" },
    { name: "Chocolate Drizzle", icon: "chocolate", price: 60, ingredientId: "507f191e810c19729de86203" },
    { name: "Edible Glitter", icon: "glitter", price: 70, ingredientId: "507f191e810c19729de86204" },
    { name: "Mini Macarons", icon: "heart", price: 110, ingredientId: "507f191e810c19729de86205" }
  ]
};

function getToppingOptions(productType) {
  return PRODUCT_TOPPINGS[productType] || PRODUCT_TOPPINGS.cake;
}

async function adjustIngredientStock(ingredientId, action) {
  if (!ingredientId) return;
  const quantity = action === "increase" ? 1 : action === "decrease" ? -1 : 0;
  if (quantity === 0) return;

  const endpoint = `/api/bakery/ingredients/stock`;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientId, quantity })
    });
  } catch (error) {
    console.warn("Ingredient stock update failed", action, ingredientId, error);
  }
}

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
          <div className="opt-card-icon">
            <Icon name="cake" size={20} />
          </div>
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

export function ToppingsStep({ productType }) {
  const { state, updateState } = useApp();
  const options = getToppingOptions(productType);

  const toggles = async (option) => {
    const currentToppings = [...(state.toppings || [])];
    const idx = currentToppings.findIndex(t => t.name === option.name);
    const isSelected = idx >= 0;

    if (isSelected) {
      currentToppings.splice(idx, 1);
      updateState("toppings", currentToppings);
      await adjustIngredientStock(option.ingredientId, "increase");
    } else {
      currentToppings.push({ name: option.name, price: option.price, ingredientId: option.ingredientId });
      updateState("toppings", currentToppings);
      await adjustIngredientStock(option.ingredientId, "decrease");
    }
  };

  return (
    <div className="toppings-grid">
      {options.map((option) => {
        const isSelected = (state.toppings || []).some(t => t.name === option.name);
        return (
          <div
            key={option.name}
            className={`topping-card ${isSelected ? "selected" : ""} ${option.oos ? "out-of-stock" : ""}`}
            onClick={() => !option.oos && toggles(option)}
          >
            {isSelected && (
              <div className="check">
                <Icon name="check" size={12} />
              </div>
            )}
            <div className="topping-icon">
              <Icon name={option.icon} size={22} />
            </div>
            <div className="topping-name">{option.name}</div>
            <div className="topping-price" style={option.oos ? { color: "var(--ink-muted)" } : {}}>
              {option.oos ? "Out of Stock" : `+Rs ${option.price}`}
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
    { name: "Birthday Candles", icon: "candle", price: 80 },
    { name: "Sparkler", icon: "sparkler", price: 120 },
    { name: "Ribbon Border", icon: "ribbon", price: 60 }
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
          <div className="deco-emoji">
            <Icon name={o.icon} size={20} />
          </div>
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
        <div className="deco-emoji">
          <Icon name="number" size={20} />
        </div>
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

// Pizza-specific steps
export function CrustStep() {
  const { state, updateState } = useApp();
  const options = [
    { type: "Thin", price: 0, label: "Thin Crust", desc: "Crispy and light" },
    { type: "Thick", price: 50, label: "Thick Crust", desc: "Soft and chewy" },
    { type: "Stuffed", price: 100, label: "Stuffed Crust", desc: "Cheese-filled edges" }
  ];

  return (
    <div className="crust-grid">
      {options.map((opt) => (
        <div
          key={opt.type}
          className={`crust-card ${state.crust?.type === opt.type ? "selected" : ""}`}
          onClick={() => updateState("crust", { type: opt.type, price: opt.price })}
        >
          <div className="crust-icon">
            <Icon name="pizza" size={24} />
          </div>
          <div className="crust-name">{opt.label}</div>
          <div className="crust-desc">{opt.desc}</div>
          <div className="crust-price">{opt.price === 0 ? "Included" : `+Rs ${opt.price}`}</div>
        </div>
      ))}
    </div>
  );
}

export function SauceStep() {
  const { state, updateState } = useApp();
  const options = [
    { type: "Marinara", price: 0, label: "Marinara", desc: "Classic tomato sauce" },
    { type: "Pesto", price: 80, label: "Pesto", desc: "Basil and pine nut sauce" },
    { type: "White", price: 60, label: "White Sauce", desc: "Creamy garlic sauce" },
    { type: "BBQ", price: 70, label: "BBQ Sauce", desc: "Sweet and smoky" }
  ];

  return (
    <div className="sauce-grid">
      {options.map((opt) => (
        <div
          key={opt.type}
          className={`sauce-card ${state.sauce?.type === opt.type ? "selected" : ""}`}
          onClick={() => updateState("sauce", { type: opt.type, price: opt.price })}
        >
          <div className="sauce-color" style={{ backgroundColor: getSauceColor(opt.type) }}></div>
          <div className="sauce-name">{opt.label}</div>
          <div className="sauce-desc">{opt.desc}</div>
          <div className="sauce-price">{opt.price === 0 ? "Included" : `+Rs ${opt.price}`}</div>
        </div>
      ))}
    </div>
  );
}

export function CheeseStep() {
  const { state, updateState } = useApp();
  const options = [
    { type: "Regular", price: 0, label: "Regular Cheese", desc: "Mozzarella blend" },
    { type: "Extra", price: 50, label: "Extra Cheese", desc: "Double portion" },
    { type: "Vegan", price: 60, label: "Vegan Cheese", desc: "Plant-based alternative" },
    { type: "None", price: 0, label: "No Cheese", desc: "Cheese-free option" }
  ];

  return (
    <div className="cheese-grid">
      {options.map((opt) => (
        <div
          key={opt.type}
          className={`cheese-card ${state.cheese?.type === opt.type ? "selected" : ""}`}
          onClick={() => updateState("cheese", { type: opt.type, price: opt.price })}
        >
          <div className="cheese-icon">🧀</div>
          <div className="cheese-name">{opt.label}</div>
          <div className="cheese-desc">{opt.desc}</div>
          <div className="cheese-price">{opt.price === 0 ? "Included" : `+Rs ${opt.price}`}</div>
        </div>
      ))}
    </div>
  );
}

export function SpecialInstructionsStep() {
  const { state, updateState } = useApp();

  return (
    <div className="special-instructions">
      <textarea
        className="instructions-input"
        rows="3"
        maxLength="100"
        placeholder="e.g. Extra crispy, well done, cut into squares..."
        value={state.specialInstructions || ""}
        onChange={e => updateState("specialInstructions", e.target.value)}
      ></textarea>
      <div className="instructions-counter">
        <span>{(state.specialInstructions || "").length}</span>/100
      </div>
    </div>
  );
}

// Donut-specific steps
export function BaseStep() {
  const { state, updateState } = useApp();
  const options = [
    { type: "Yeast", price: 0, label: "Yeast Donut", desc: "Light and fluffy" },
    { type: "Cake", price: 20, label: "Cake Donut", desc: "Dense and moist" },
    { type: "Glazed", price: 0, label: "Classic Glazed", desc: "Traditional favorite" }
  ];

  return (
    <div className="base-grid">
      {options.map((opt) => (
        <div
          key={opt.type}
          className={`base-card ${state.base?.type === opt.type ? "selected" : ""}`}
          onClick={() => updateState("base", { type: opt.type, price: opt.price })}
        >
          <div className="base-icon">🍩</div>
          <div className="base-name">{opt.label}</div>
          <div className="base-desc">{opt.desc}</div>
          <div className="base-price">{opt.price === 0 ? "Included" : `+Rs ${opt.price}`}</div>
        </div>
      ))}
    </div>
  );
}

export function FillingStep() {
  const { state, updateState } = useApp();
  const options = [
    { type: "None", price: 0, label: "No Filling", desc: "Classic donut" },
    { type: "Cream", price: 40, label: "Cream Filling", desc: "Vanilla custard" },
    { type: "Jelly", price: 35, label: "Jelly Filling", desc: "Fruit preserve" },
    { type: "Custard", price: 45, label: "Custard", desc: "Rich and creamy" },
    { type: "Chocolate", price: 40, label: "Chocolate", desc: "Dark chocolate ganache" }
  ];

  return (
    <div className="filling-grid">
      {options.map((opt) => (
        <div
          key={opt.type}
          className={`filling-card ${state.filling?.type === opt.type ? "selected" : ""}`}
          onClick={() => updateState("filling", { type: opt.type, price: opt.price })}
        >
          <div className="filling-icon">{getFillingIcon(opt.type)}</div>
          <div className="filling-name">{opt.label}</div>
          <div className="filling-desc">{opt.desc}</div>
          <div className="filling-price">{opt.price === 0 ? "Included" : `+Rs ${opt.price}`}</div>
        </div>
      ))}
    </div>
  );
}

export function GlazeStep() {
  const { state, updateState } = useApp();
  const options = [
    { type: "Chocolate", price: 0, label: "Chocolate Glaze", desc: "Rich and glossy" },
    { type: "Vanilla", price: 0, label: "Vanilla Glaze", desc: "Sweet and simple" },
    { type: "Strawberry", price: 20, label: "Strawberry Glaze", desc: "Pink and fruity" },
    { type: "Maple", price: 25, label: "Maple Glaze", desc: "Warm and sweet" }
  ];

  return (
    <div className="glaze-grid">
      {options.map((opt) => (
        <div
          key={opt.type}
          className={`glaze-card ${state.glaze?.type === opt.type ? "selected" : ""}`}
          onClick={() => updateState("glaze", { type: opt.type, price: opt.price })}
        >
          <div className="glaze-color" style={{ backgroundColor: getGlazeColor(opt.type) }}></div>
          <div className="glaze-name">{opt.label}</div>
          <div className="glaze-desc">{opt.desc}</div>
          <div className="glaze-price">{opt.price === 0 ? "Included" : `+Rs ${opt.price}`}</div>
        </div>
      ))}
    </div>
  );
}

export function SprinklesStep() {
  const { state, updateState } = useApp();
  const options = [
    { name: "Rainbow Sprinkles", price: 15, icon: "rainbow" },
    { name: "Chocolate Sprinkles", price: 12, icon: "chocolate" },
    { name: "Coconut Flakes", price: 18, icon: "coconut" },
    { name: "Chopped Nuts", price: 20, icon: "nuts" }
  ];

  const toggles = (name, price) => {
    let ss = [...(state.sprinkles || [])];
    const idx = ss.findIndex(s => s.name === name);
    if (idx >= 0) ss.splice(idx, 1);
    else ss.push({ name, price });
    updateState("sprinkles", ss);
  };

  return (
    <div className="sprinkles-grid">
      {options.map(o => {
        const isSelected = (state.sprinkles || []).some(s => s.name === o.name);
        return (
          <div
            key={o.name}
            className={`sprinkle-card ${isSelected ? "selected" : ""}`}
            onClick={() => toggles(o.name, o.price)}
          >
            {isSelected && (
              <div className="check">
                <Icon name="check" size={12} />
              </div>
            )}
            <div className="sprinkle-icon">
              <Icon name={o.icon} size={22} />
            </div>
            <div className="sprinkle-name">{o.name}</div>
            <div className="sprinkle-price">+Rs {o.price}</div>
          </div>
        );
      })}
    </div>
  );
}

export function DrizzleStep() {
  const { state, updateState } = useApp();

  return (
    <div className="drizzle-option">
      <div
        className={`drizzle-card ${state.drizzle ? "selected" : ""}`}
        onClick={() => updateState("drizzle", !state.drizzle)}
      >
        {state.drizzle && (
          <div className="check">
            <Icon name="check" size={12} />
          </div>
        )}
        <div className="drizzle-icon">🍫</div>
        <div className="drizzle-content">
          <div className="drizzle-name">Chocolate Drizzle</div>
          <div className="drizzle-desc">Extra chocolate drizzle on top</div>
          <div className="drizzle-price">+Rs 25</div>
        </div>
      </div>
    </div>
  );
}

// Cupcake-specific steps
export function QuantityStep() {
  const { state, updateState } = useApp();
  const options = [
    { count: 1, price: 0, label: "1 Cupcake", desc: "Single serving" },
    { count: 6, price: 50, label: "Half Dozen", desc: "6 cupcakes - 10% off" },
    { count: 12, price: 80, label: "Dozen", desc: "12 cupcakes - 20% off" },
    { count: 24, price: 120, label: "Two Dozen", desc: "24 cupcakes - 30% off" }
  ];

  return (
    <div className="quantity-grid">
      {options.map((opt) => (
        <div
          key={opt.count}
          className={`quantity-card ${state.quantity === opt.count ? "selected" : ""}`}
          onClick={() => updateState("quantity", opt.count)}
        >
          <div className="quantity-icon">🧁</div>
          <div className="quantity-name">{opt.label}</div>
          <div className="quantity-desc">{opt.desc}</div>
          <div className="quantity-price">{opt.price === 0 ? "Base price" : `+Rs ${opt.price}`}</div>
        </div>
      ))}
    </div>
  );
}

// Helper functions
function getSauceColor(type) {
  const colors = {
    "Marinara": "#DC143C",
    "Pesto": "#228B22",
    "White": "#FFFACD",
    "BBQ": "#8B4513"
  };
  return colors[type] || "#DC143C";
}

function getFillingIcon(type) {
  const icons = {
    "None": "🍩",
    "Cream": "🥛",
    "Jelly": "🍯",
    "Custard": "🍮",
    "Chocolate": "🍫"
  };
  return icons[type] || "🍯";
}

function getGlazeColor(type) {
  const colors = {
    "Chocolate": "#8B4513",
    "Vanilla": "#FFFACD",
    "Strawberry": "#FFB6C1",
    "Maple": "#D2691E"
  };
  return colors[type] || "#FFFACD";
}
