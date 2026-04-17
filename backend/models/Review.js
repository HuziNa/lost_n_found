import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      maxlength: 1000,
    },

    isHidden: {
      type: Boolean,
      default: false, // for admin moderation
    },
  },
  { timestamps: true }
);

// One review per user per bakery
reviewSchema.index({ userId: 1, bakeryId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);