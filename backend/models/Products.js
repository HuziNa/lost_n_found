import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    bakery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    name: { type: String, required: true },
    description: String,

    basePrice: { type: Number, required: true },

    category: {
      type: String,
      enum: ["Cake", "Cupcake", "Pastry", "Bread", "Pizza"],
    },

    isCustomizable: { type: Boolean, default: false },

    // ✅ For FIXED products ONLY
    recipe: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
        },
        amountRequired: Number,
      },
    ],

    // 🔥 NEW: For CUSTOM products ONLY (base ingredients like dough, eggs etc)
    baseRecipe: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
        },
        amountRequired: Number,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
