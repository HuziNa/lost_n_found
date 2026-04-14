import mongoose from 'mongoose';

// variation of a single product e.g size or layer
// priceModifier is added price of the variation chosen
const productVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  priceModifier: {
    type: Number,
    default: 0
  },

  recipeTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecipeTemplate"
  }
}, { timestamps: true });

export default mongoose.model("ProductVariant", productVariantSchema);