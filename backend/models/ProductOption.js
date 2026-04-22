import mongoose from "mongoose";

// defines the actual options available to choose from for that option (compund ingredient)
const optionChoiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // chocolate, vanilla etc

    ingredientId: { // coca powder for chocolate sponge, vanilla extract for vanilla sponge 
      // for the chocolate sponge option, the choice of chocolate would link compund ingreidient we have made
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: false,
    },

    quantity: { type: Number, required: false },
    extraPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

// defines an option/choice a user can make for a category for example sponge of a cake
// for exm the spinge of a cake and then in the option choices we have chocolate, vanilla etc
const productOptionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: { type: String, required: true },
    required: { type: Boolean, default: false },

    perLayer: { type: Boolean, default: false },
    maxSelections: { type: Number }, // for example max 3 layers of sponge

    templateKey: { type: String }, // Links to standard segments like 'frosting_color'
    choices: [optionChoiceSchema],
  },
  { timestamps: true }
);

export default mongoose.model("ProductOption", productOptionSchema);