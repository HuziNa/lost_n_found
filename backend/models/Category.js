import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);