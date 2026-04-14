import mongoose from 'mongoose';


// Order item is an instance of a product ordered by a customer
// it contains all info about the complete product
// priceAtPurchase will give final price after adding up prices of all price layers before
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
    },

    quantity: {
      type: Number,
      default: 1,
    },

// stores all the customizations on base product that the customer chose
    customization: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

// runtime recipe generated for customizable product by combining base recipe + customization
    recipeInstance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipeInstance",
    },

// final price at purchase time after calculating all price layers (base product + variant + customization)
    priceAtPurchase: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OrderItem", orderItemSchema);