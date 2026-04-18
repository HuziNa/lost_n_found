import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    bakery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    name: { type: String, required: true },

    quantity: { type: Number, required: true },

    unit: { type: String, default: "grams" },

    alertThreshold: { type: Number, default: 500 },
  },
  { timestamps: true },
);

export default mongoose.model("Ingredient", ingredientSchema);
