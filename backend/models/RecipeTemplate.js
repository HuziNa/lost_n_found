import mongoose from 'mongoose';

// Recipe templates for NON CUSTOMIZABLE products
const recipeTemplateSchema = new mongoose.Schema({
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },

  ingredients: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
      },
      quantityRequired: {
        type: Number,
        required: true
      }
    }
  ]
}, { timestamps: true });

export default mongoose.model('RecipeTemplate', recipeTemplateSchema);