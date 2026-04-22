import mongoose from "mongoose";

// defines the actual options available to choose from for that option (compund ingredient)
const optionChoiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // chocolate, vanilla etc

    ingredientId: { // coca powder for chocolate sponge, vanilla extract for vanilla sponge 
      // for the chocolate sponge option, the choice of chocolate would link compund ingreidient we have made
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
// for exm the spinge of a cake and then in the option choices we have chocolate, vanilla etc
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
    maxSelections: { type: Number }, // for example max 3 layers of sponge

    basePrice: { type: Number, required: true },

    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },

    ingredientsText: { type: String, default: "" },

    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },

    ingredientsText: { type: String, default: "" },

    // for the fixed items 
    ingredients: {
      type: [productIngredientSchema],
      default: [],
    },

    allergens: {
      type: [String],
      default: [],
    },

    nutrition: nutritionSchema,

    selectedTemplate: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductOption", productOptionSchema);