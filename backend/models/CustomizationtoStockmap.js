import mongoose from "mongoose";

const customizationToStockMapSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // MUST match CustomizationOption name OR ID
    optionName: {
      type: String,
      required: true,
    },

    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stock",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model(
  "customizationToStockMap",
  customizationToStockMapSchema
);