import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fats: Number,
    sugar: Number,
    fiber: Number,
  },
  { _id: false }
);

const productIngredientSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

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

    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },

    ingredientsText: { type: String, default: "" },

    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },

    ingredientsText: { type: String, default: "" },

    // for the fixed items 
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
