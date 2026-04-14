import mongoose from 'mongoose';

// Recipe for CUSTOMIZABLE products stored after user creates an order
const recipeInstanceSchema = new mongoose.Schema({
  orderItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  },

  ingredientsUsed: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
      },
      quantityUsed: {
        type: Number,
        required: true
      }
    }
  ]
}, { timestamps: true });

export default mongoose.model('RecipeInstance', recipeInstanceSchema);