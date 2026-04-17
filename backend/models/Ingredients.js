import mongoose from "mongoose";

// defines recipe for a compound ingredient 
const ingredientRecipeSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

// defines an ingredient which can be raw like flour or compound like chocolate frosting
const ingredientSchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    name: { type: String, required: true },
    unit: { type: String, enum: ["g", "ml", "pcs"], required: true },
    pricePerUnit: { type: Number, required: true },

    // if empty then raw ingredient not compound
    recipe: [ingredientRecipeSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Ingredient", ingredientSchema);