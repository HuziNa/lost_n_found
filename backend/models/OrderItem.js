import mongoose from 'mongoose';


// Order item is an instance of a product ordered by a customer
// it contains all info about the complete product
// priceAtPurchase will give final price after adding up prices of all price layers before
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },

  quantity: { type: Number, default: 1 },

  customization: {
    spongeType: String,
    frostingColor: String,
    toppings: [String],
    messageOnCake: String
  },

  recipeInstance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeInstance'
  },

  priceAtPurchase: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('OrderItem', orderItemSchema);