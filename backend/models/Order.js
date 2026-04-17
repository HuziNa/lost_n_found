import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bakery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        quantity: { type: Number, default: 1 },

        // UI/UX level customization
        customDetails: {
          spongeType: String,
          frostingColor: String,
          toppings: [String],
          size: String,
          messageOnCake: String,
        },

        // 🔥 FINAL INGREDIENT LIST USED (VERY IMPORTANT)
        customRecipe: [
          {
            ingredient: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Ingredient",
            },
            amountUsed: Number,
          },
        ],

        priceAtPurchase: Number,
      },
    ],

    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Preparing",
        "Ready",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
