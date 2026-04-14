import mongoose from "mongoose";

// has categories of products for a bakery
// e.g cakes, pizza, donuts, cupcakes
// owners can add more categories
const categorySchema = new mongoose.Schema({
  bakery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bakery",
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);