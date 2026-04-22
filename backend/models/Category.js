import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },
    name: { type: String, required: true },
    globalCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlobalCategory",
      required: true,
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);