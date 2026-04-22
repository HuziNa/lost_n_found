import mongoose from "mongoose";

// Ingredient used in products (for fixed products)
const productIngredientSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

// Nutrition information
const nutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
  },
  { _id: false }
);

// defines the actual options available to choose from for that option (compound ingredient)
const optionChoiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // chocolate, vanilla etc

    ingredientId: { // coca powder for chocolate sponge, vanilla extract for vanilla sponge
      // for the chocolate sponge option, the choice of chocolate would link compound ingredient we have made
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },

    quantity: { type: Number, required: true },
    extraPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

// defines an option/choice a user can make for a product for example sponge of a cake
// for e.g. the sponge of a cake and then in the option choices we have chocolate, vanilla etc
const productOptionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true },
    required: { type: Boolean, default: false },

    perLayer: { type: Boolean, default: false },
    maxSelections: { type: Number }, // for example max 3 layers of sponge

    basePrice: { type: Number, required: true },

    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },

    ingredientsText: { type: String, default: "" },

    choices: [optionChoiceSchema],
  },
  { timestamps: true }
);

// Product schema
const productSchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["FIXED", "CUSTOMIZABLE"],
      required: true,
    },
    basePrice: { type: Number, required: true },
    // Only for FIXED products
    ingredients: {
      type: [productIngredientSchema],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    nutrition: nutritionSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
export { productOptionSchema, optionChoiceSchema, productIngredientSchema, nutritionSchema };