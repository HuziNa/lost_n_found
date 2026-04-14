import mongoose from 'mongoose';

// represents a product on storefront
// two types of products customizable and non customizable
const productSchema = new mongoose.Schema({
  bakery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bakery",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  description: String,

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  basePrice: {
    type: Number,
    required: true
  },

  productType: {
    type: String,
    enum: ["FIXED", "CUSTOM"],
    required: true
  },

// customizable structure supports: 
// - cakes (multi-layer)
// - pizza (crust + toppings)
// - donuts (filling + glaze)
// - drinks (size, sugar, ice)
  customizableStructure: [
    {
      name: {
        type: String,
        required: true
      },

// type defines UI behaviour
// single select is for single option selection e.g pizza size
// multi select is for multiple option selection e.g pizza toppings
// group is for structured block of components e.g cake layers
      type: {
        type: String,
        enum: ["single-select", "multi-select", "group"],
        required: true
      },

// used when type = group. This tells whether layers are repeated or no
      repeatable: {
        type: Boolean,
        default: false
      },

      maxCount: {
        type: Number
      },

// used to show the selections for single-select and multi-select types. For group type, these are the options for each component block
      options: [
        {
          name: String,
          extraPrice: {
            type: Number,
            default: 0
          }
        }
      ],

// used when type = group. A structured block of components will be repeated
      components: [
        {
          name: {
            type: String,
            required: true
          },

          type: {
            type: String,
            enum: ["single-select", "multi-select"],
            required: true
          },

          options: [
            {
              name: String,
              extraPrice: {
                type: Number,
                default: 0
              }
            }
          ]
        }
      ]
    }
  ],

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);