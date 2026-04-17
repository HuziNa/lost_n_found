import mongoose from "mongoose";

// defines the actual options available to choose from for that option
const optionChoiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    ingredientId: {
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
    maxSelections: { type: Number },

    choices: [optionChoiceSchema],
  },
  { timestamps: true }
);

export default mongoose.model("ProductOption", productOptionSchema);