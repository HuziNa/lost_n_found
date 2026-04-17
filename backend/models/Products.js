import mongoose from "mongoose";

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
    basePrice: { type: Number, required: true },

    type: {
      type: String,
      enum: ["fixed", "custom"],
      required: true,
    },

    // Used only for FIXED products
    ingredients: [productIngredientSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);