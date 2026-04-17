import mongoose from "mongoose";

// schema for the options selected for a product in an order
const selectedOptionSchema = new mongoose.Schema(
  {
    optionName: { type: String, required: true },
    choiceName: { type: String },

    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },

    quantity: { type: Number, required: true },
    layer: { type: Number }, // optional
  },
  { _id: false }
);

// schema for a product in an order
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: { type: Number, required: true },

    selectedOptions: [selectedOptionSchema],

    finalPrice: { type: Number, required: true },
  },
  { _id: false }
);

// the full order schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    items: [orderItemSchema],

    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);