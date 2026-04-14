import React, { useState } from "react";
import { Link } from "react-router-dom";
import OrderSidebar from "../components/customize/OrderSidebar";
import {
  StepCard,
  SizeStep,
  LayersStep,
  FrostingStep,
  ToppingsStep,
  MessageStep,
  DecorationsStep,
} from "../components/customize/Steps";
import { useApp } from "../context/AppContext";

export default function CustomizePage() {
  const [openStep, setOpenStep] = useState(1);
  const { state } = useApp();

  const toggleStep = (step) => setOpenStep(openStep === step ? 0 : step);

  return (
    <div className="page active" id="page-customize">
      <div className="custom-page">
        <div className="custom-breadcrumb">
          <Link to="/"><span>Home</span></Link>
          <span style={{ color: "var(--ink-muted)", margin: "0 8px" }}>›</span>
          <Link to="/"><span>Collection</span></Link>
          <span style={{ color: "var(--ink-muted)", margin: "0 8px" }}>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>Bespoke Cake</span>
        </div>
        <h1 className="custom-title">Build Your Cake</h1>
        <p className="custom-subtitle">
          Customize every detail — your dream cake, exactly the way you want it.
        </p>

        <div className="custom-layout">
          <div className="steps-container">
            <StepCard
              num="1"
              title="Choose Your Size"
              subtitle={state.size.name}
              isOpen={openStep === 1}
              toggleOpen={() => toggleStep(1)}
            >
              <SizeStep />
            </StepCard>

            <StepCard
              num="2"
              title="Number of Layers"
              subtitle={`${state.layers.count} Layer${state.layers.count > 1 ? "s selected" : " selected"}`}
              isOpen={openStep === 2}
              toggleOpen={() => toggleStep(2)}
            >
              <LayersStep />
            </StepCard>

            <StepCard
              num="3"
              title="Choose Your Frosting"
              subtitle={`${state.frost.flavor} · ${state.frostColor}`}
              isOpen={openStep === 3}
              toggleOpen={() => toggleStep(3)}
            >
              <FrostingStep />
            </StepCard>

            <StepCard
              num="4"
              title="Add Toppings"
              subtitle={state.toppings.length ? state.toppings.map(t => t.name).join(", ") : "None selected"}
              isOpen={openStep === 4}
              toggleOpen={() => toggleStep(4)}
            >
              <ToppingsStep />
            </StepCard>

            <StepCard
              num="5"
              title="Message on Cake"
              subtitle={state.message || "No message added"}
              isOpen={openStep === 5}
              toggleOpen={() => toggleStep(5)}
            >
              <MessageStep />
            </StepCard>

            <StepCard
              num="6"
              title="Candles & Decorations"
              subtitle={state.decos.length ? state.decos.map(d => d.name === "Number Candle" ? `Number Candle (${state.numCandle})` : d.name).join(", ") : "None selected"}
              isOpen={openStep === 6}
              toggleOpen={() => toggleStep(6)}
            >
              <DecorationsStep />
            </StepCard>
          </div>

          <OrderSidebar />
        </div>
      </div>
    </div>
  );
}
