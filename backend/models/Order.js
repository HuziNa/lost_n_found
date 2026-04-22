import mongoose from "mongoose";

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
    layer: { type: Number },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, default: "" },
    quantity: { type: Number, required: true },
    selectedOptions: [selectedOptionSchema],
    finalPrice: { type: Number, required: true },
  },
  { _id: false }
);

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
      enum: ["pending", "baking", "ready", "completed", "cancelled"],
      default: "pending",
    },

    // ── Delivery info ──────────────────────────────────────────────────────
    deliveryOption: {
      type: String,
      enum: ["standard", "express", "pickup"],
      default: "standard",
    },

    deliveryFee: { type: Number, default: 0 },

    deliveryAddress: {
      street: { type: String, default: "" },
      city:   { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },

    deliveryInstructions: { type: String, default: "" },

    // ── Customer contact ───────────────────────────────────────────────────
    customerPhone: { type: String, default: "" },

    // ── Payment ────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["cod", "bank"],
      default: "cod",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
