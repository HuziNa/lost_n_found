import mongoose from "mongoose";

const bakerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    contactNumber: { type: String },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Bakery", bakerySchema);
