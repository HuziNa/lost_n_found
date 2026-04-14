import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

const COLOR_MAP = {
  Cream: "#FFF5EC",
  "Blush Pink": "#F2C4B0",
  "Baby Blue": "#C8DFF0",
  Mint: "#B8D8B9",
  Lavender: "#D4B8E0",
  Peach: "#F5CBA7",
  Coral: "#F1948A",
};

export default function OrderSidebar() {
  const { state, updateState, calcTotal, applyVoucher, addToCart } = useApp();
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherMsg, setVoucherMsg] = useState("");

  const color = COLOR_MAP[state.frostColor] || "#FFF5EC";
  const tierCount = state.layers.count;
  const heights = tierCount === 1 ? [60] : tierCount === 2 ? [52, 46] : [44, 40, 36];
  const widths = tierCount === 1 ? [160] : tierCount === 2 ? [160, 120] : [160, 125, 90];

  let y = 155;
  const tiers = [];
  for (let i = 0; i < tierCount; i++) {
    const w = widths[i];
    const h = heights[i];
    const x = 100 - w / 2;
    y -= h;
    tiers.push(
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} rx="5" fill={color} stroke="rgba(28,20,16,0.08)" strokeWidth="1" />
        <rect x={x} y={y} width={w} height="7" rx="3" fill="rgba(255,255,255,0.65)" />
      </g>
    );
  }

  const hasCandles = state.decos.some(d => d.name === "Birthday Candles" || d.name === "Number Candle");
  const hasFruits = state.toppings.some(t => t.name === "Fresh Fruits");
  const hasSprinkles = state.toppings.some(t => t.name === "Sprinkles");

  const ff = state.font === "cursive" ? "Cormorant Garamond,serif" : state.font === "serif" ? "Georgia,serif" : "Jost,sans-serif";
  const fs = state.font === "cursive" ? "italic" : "normal";

  const { subtotal, discountAmt, total } = calcTotal();
  const toppingTotal = state.toppings.reduce((s, t) => s + t.price, 0);
  const decoTotal = state.decos.reduce((s, d) => s + d.price, 0);

  const handleVoucher = () => {
    const msg = applyVoucher(voucherInput);
    setVoucherMsg(msg);
  };

  const handleAddToCart = () => {
    addToCart({
      name: "Custom " + state.size.name + " Cake",
      detail: `${state.frost.flavor} frosting · ${state.frostColor} · ${state.layers.count} layer${state.layers.count > 1 ? "s" : ""}${state.toppings.length ? " · " + state.toppings.map(t => t.name).join(", ") : ""}`,
      price: total,
      emoji: "🎂"
    });
  };

  const saveDesign = () => alert("✓ Design saved! Share link copied to clipboard.");

  return (
    <div className="order-sidebar">
      <div className="order-card">
        <div className="order-card-header">
          <span style={{ fontSize: "20px", opacity: 0.7 }}>✦</span>
          <div className="order-card-title">Your Bespoke Cake</div>
        </div>

        <div className="order-preview" id="cake-preview-area">
          <svg viewBox="0 0 200 180" width="180" height="160" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="170" rx="80" ry="8" fill="rgba(28,20,16,0.08)" />
            <ellipse cx="100" cy="164" rx="78" ry="7" fill="#C9B49A" />
            <ellipse cx="100" cy="161" rx="76" ry="6" fill="#E8D5C0" />
            
            <g id="preview-tiers">{tiers}</g>
            
            <g id="preview-candles">
              {hasCandles && (
                <>
                  <rect x="96" y={y - 28} width="8" height="26" rx="3" fill="#F9D77E" />
                  <ellipse cx="100" cy={y - 29} rx="5" ry="7" fill="#FFD700" />
                  <ellipse cx="100" cy={y - 27} rx="3" ry="5" fill="#FF8C00" />
                </>
              )}
            </g>
            
            <g id="preview-toppings">
              {hasFruits && (
                <>
                  <text x="80" y={y - 2} fontSize="12">🍓</text>
                  <text x="100" y={y - 2} fontSize="12">🫐</text>
                  <text x="120" y={y - 2} fontSize="12">🍓</text>
                </>
              )}
              {hasSprinkles && (
                <>
                  <rect x="75" y={y + 10} width="10" height="3" rx="1.5" fill="#F9D77E" transform={`rotate(-20,75,${y + 10})`} />
                  <rect x="110" y={y + 12} width="10" height="3" rx="1.5" fill="#D4856A" transform={`rotate(15,110,${y + 12})`} />
                </>
              )}
            </g>
            
            <g id="preview-msg-group">
              {state.message && (
                <text x="100" y={y + heights[0] - 12} textAnchor="middle" fontSize="9" fill="#1C1410" fontFamily={ff} fontStyle={fs}>
                  {state.message.substring(0, 20)}
                </text>
              )}
            </g>
          </svg>
        </div>

        <div className="order-lines">
          <div className="order-line">
            <span>Base cake ({state.size.name})</span>
            <span>Rs {state.size.price.toLocaleString()}</span>
          </div>
          <div className="order-line">
            <span>+ {state.layers.count} Layer{state.layers.count > 1 ? "s" : ""}</span>
            <span>{state.layers.extra ? `Rs ${state.layers.extra}` : "Included"}</span>
          </div>
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
        {voucherMsg && (
          <div className={`voucher-msg ${voucherMsg.startsWith("✓") ? "success" : "error"}`}>
            {voucherMsg}
          </div>
        )}

        <div className="sidebar-actions">
          <button className="btn-save" onClick={saveDesign}>🤍 Save Design</button>
          <button className="btn-cart" onClick={handleAddToCart}>✦ Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
