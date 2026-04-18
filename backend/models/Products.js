import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number }, // kcal
    protein: { type: Number },  // grams
    carbohydrates: { type: Number }, // grams
    fats: { type: Number }, // grams
    sugar: { type: Number }, // grams
    fiber: { type: Number }, // grams
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

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    type: {
      type: String,
      enum: ["FIXED", "CUSTOMIZABLE"],
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
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
