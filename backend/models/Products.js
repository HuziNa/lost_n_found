import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    bakery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: String,

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
    },

    // FIXED → predefined recipe
    // CUSTOM → user builds it
    productType: {
      type: String,
      enum: ["FIXED", "CUSTOM"],
      required: true,
    },

    /**
     * Flexible customization engine
     * Works for cakes, pizza, donuts, drinks, etc.
     */
    customizableStructure: [
      {
        name: {
          type: String,
          required: true,
        },

        // UI + logic behavior
        type: {
          type: String,
          enum: ["single-select", "multi-select", "group"],
          required: true,
        },

        // Used for cake layers
        repeatable: {
          type: Boolean,
          default: false,
        },

        maxCount: Number,

        // Used for single/multi select
        options: [
          {
            name: String,
            extraPrice: {
              type: Number,
              default: 0,
            },
          },
        ],

        // Used for group (cake layers)
        components: [
          {
            name: {
              type: String,
              required: true,
            },

            type: {
              type: String,
              enum: ["single-select", "multi-select"],
              required: true,
            },

            options: [
              {
                name: String,
                extraPrice: {
                  type: Number,
                  default: 0,
                },
              },
            ],
          },
        ],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);