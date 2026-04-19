import React from "react";
import {
  StepCard,
  SizeStep,
  LayersStep,
  FrostingStep,
  ToppingsStep,
  MessageStep,
  DecorationsStep,
  CrustStep,
  SauceStep,
  CheeseStep,
  SpecialInstructionsStep,
  BaseStep,
  FillingStep,
  GlazeStep,
  SprinklesStep,
  DrizzleStep,
  QuantityStep,
} from "./Steps";

const STEP_COMPONENTS = {
  size: SizeStep,
  layers: LayersStep,
  frosting: FrostingStep,
  toppings: ToppingsStep,
  message: MessageStep,
  decorations: DecorationsStep,
  crust: CrustStep,
  sauce: SauceStep,
  cheese: CheeseStep,
  special: SpecialInstructionsStep,
  base: BaseStep,
  filling: FillingStep,
  glaze: GlazeStep,
  sprinkles: SprinklesStep,
  drizzle: DrizzleStep,
  quantity: QuantityStep,
};

const getStepSubtitle = (stepKey, state) => {
  switch (stepKey) {
    case "size":
      return state.size?.name || "Not selected";
    case "layers":
      return `${state.layers?.count || 0} Layer${(state.layers?.count || 0) > 1 ? "s" : ""} selected`;
    case "frosting":
      return `${state.frost?.flavor || ""} · ${state.frostColor || ""}`.trim() || "Not selected";
    case "toppings":
      return state.toppings?.length ? state.toppings.map(t => t.name).join(", ") : "None selected";
    case "message":
      return state.message || "No message added";
    case "decorations":
      return state.decos?.length ? state.decos.map(d => d.name === "Number Candle" ? `Number Candle (${state.numCandle})` : d.name).join(", ") : "None selected";
    case "crust":
      return state.crust?.type || "Not selected";
    case "sauce":
      return state.sauce?.type || "Not selected";
    case "cheese":
      return state.cheese?.type || "Not selected";
    case "special":
      return state.specialInstructions || "No instructions";
    case "base":
      return state.base?.type || "Not selected";
    case "filling":
      return state.filling?.type || "Not selected";
    case "glaze":
      return state.glaze?.type || "Not selected";
    case "sprinkles":
      return state.sprinkles?.length ? state.sprinkles.map(s => s.name).join(", ") : "None selected";
    case "drizzle":
      return state.drizzle ? "Added" : "Not added";
    case "quantity":
      return `${state.quantity || 1} item${(state.quantity || 1) > 1 ? "s" : ""}`;
    default:
      return "Not selected";
  }
};

export default function DynamicSteps({ productType, config, openStep, toggleStep, state }) {
  return (
    <>
      {config.steps.map((step, index) => {
        const StepComponent = STEP_COMPONENTS[step.key];
        const stepNumber = index + 1;
        const subtitle = getStepSubtitle(step.key, state);

        return (
          <StepCard
            key={step.key}
            num={stepNumber.toString()}
            title={step.title}
            subtitle={subtitle}
            isOpen={openStep === stepNumber}
            toggleOpen={() => toggleStep(stepNumber)}
          >
            {StepComponent && <StepComponent productType={productType} />}
          </StepCard>
        );
      })}
    </>
  );
}