export const CUSTOMIZER_TEMPLATES = {
  CAKE: {
    label: "Cake",
    segments: [
      { key: "size", name: "Size", layout: "grid", updatesSVG: true },
      { key: "tiers", name: "Tiers", layout: "buttons", updatesSVG: true },
      { key: "frosting_flavor", name: "Frosting Flavor", layout: "buttons", updatesSVG: true },
      { key: "frosting_color", name: "Frosting Color", layout: "swatches", updatesSVG: true },
      { key: "toppings", name: "Toppings", layout: "grid_check", updatesSVG: true },
      { key: "message", name: "Message", layout: "text", updatesSVG: false },
    ],
  },
  CUPCAKE: {
    label: "Cupcake",
    segments: [
      { key: "size", name: "Size", layout: "grid", updatesSVG: true },
      { key: "flavor", name: "Base Flavor", layout: "buttons", updatesSVG: true },
      { key: "frosting_flavor", name: "Frosting Flavor", layout: "buttons", updatesSVG: true },
      { key: "frosting_color", name: "Frosting Color", layout: "swatches", updatesSVG: true },
      { key: "toppings", name: "Toppings", layout: "grid_check", updatesSVG: true },
    ],
  },
  PIZZA: {
    label: "Pizza",
    segments: [
      { key: "size", name: "Size", layout: "grid", updatesSVG: true },
      { key: "shape", name: "Shape", layout: "buttons", updatesSVG: true },
      { key: "crust", name: "Crust Type", layout: "buttons", updatesSVG: true },
      { key: "sauce", name: "Sauce", layout: "buttons", updatesSVG: true },
      { key: "cheese", name: "Cheese Level", layout: "buttons", updatesSVG: true },
      { key: "spice", name: "Spice Level", layout: "buttons", updatesSVG: true },
      { key: "toppings", name: "Toppings", layout: "grid_check", updatesSVG: true },
    ],
  },
  BREAD: {
    label: "Bread",
    segments: [
      { key: "size", name: "Loaf Size", layout: "grid", updatesSVG: true },
      { key: "shape", name: "Bread Shape", layout: "buttons", updatesSVG: true },
      { key: "bake", name: "Bake Level", layout: "buttons", updatesSVG: true },
      { key: "glaze", name: "Glaze Finish", layout: "buttons", updatesSVG: true },
      { key: "topping", name: "Toppings (Seeds/Herbs)", layout: "grid_check", updatesSVG: true },
      { key: "sliced", name: "Sliced/Whole", layout: "buttons", updatesSVG: false },
    ],
  },
};

export const OWNER_PRESET_TOPPINGS = {
  CAKE: [
    { name: "Sprinkles", extraPrice: 50 },
    { name: "Fresh Berries", extraPrice: 200 },
    { name: "Gold Leaf", extraPrice: 500 },
    { name: "Chocolate Shavings", extraPrice: 150 },
    { name: "Edible Glitter", extraPrice: 120 },
    { name: "Fondant Flowers", extraPrice: 180 },
    { name: "Sugar Pearls", extraPrice: 90 },
  ],
  CUPCAKE: [
    { name: "Rainbow Sprinkles", extraPrice: 40 },
    { name: "Fruit Compote", extraPrice: 80 },
    { name: "Chocolate Drizzle", extraPrice: 60 },
    { name: "Edible Glitter", extraPrice: 70 },
    { name: "Mini Macarons", extraPrice: 140 },
  ],
  PIZZA: [
    { name: "Pepperoni", extraPrice: 140 },
    { name: "Mushrooms", extraPrice: 70 },
    { name: "Black Olives", extraPrice: 60 },
    { name: "Bell Peppers", extraPrice: 55 },
    { name: "Red Onions", extraPrice: 50 },
    { name: "Jalapenos", extraPrice: 50 },
  ],
  BREAD: [
    { name: "Sesame Seeds", extraPrice: 30 },
    { name: "Pumpkin Seeds", extraPrice: 45 },
    { name: "Sunflower Seeds", extraPrice: 45 },
    { name: "Rosemary", extraPrice: 35 },
    { name: "Thyme", extraPrice: 35 },
  ],
};

export const getPresetToppingsForTemplate = (templateKey) => {
  if (!templateKey) return OWNER_PRESET_TOPPINGS.CAKE;
  return OWNER_PRESET_TOPPINGS[String(templateKey).toUpperCase()] || OWNER_PRESET_TOPPINGS.CAKE;
};

export const getTemplateByCategory = (categoryName) => {
  if (!categoryName) return null;
  const upper = categoryName.toUpperCase();
  if (upper.includes("CAKE") && !upper.includes("CUPCAKE")) return CUSTOMIZER_TEMPLATES.CAKE;
  if (upper.includes("CUPCAKE")) return CUSTOMIZER_TEMPLATES.CUPCAKE;
  if (upper.includes("PIZZA")) return CUSTOMIZER_TEMPLATES.PIZZA;
  if (upper.includes("BREAD")) return CUSTOMIZER_TEMPLATES.BREAD;
  return null;
};
