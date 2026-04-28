import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, default: "" },
    discountType: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

voucherSchema.index({ bakeryId: 1, code: 1 }, { unique: true });
voucherSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.model("Voucher", voucherSchema);
