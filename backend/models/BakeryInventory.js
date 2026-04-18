import mongoose from "mongoose";

const bakeryInventorySchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },

    quantityAvailable: { type: Number, required: true },
  },
  { timestamps: true }
);

bakeryInventorySchema.index({ bakeryId: 1, ingredientId: 1 }, { unique: true });

export default mongoose.model("BakeryInventory", bakeryInventorySchema);