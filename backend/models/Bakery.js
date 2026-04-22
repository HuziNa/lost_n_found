import mongoose from "mongoose";

const DEFAULT_STORY =
  "A culture, tradition, lifestyle, and class - with a legacy spanning over a century. Our bakery stands as a testament to generations of craft, passion, and the belief that food is love made edible.\n\nEvery product is a masterful symphony of flavors, expertly crafted to leave you spellbound. From Presidents to families, our creations have graced the finest tables.";
const DEFAULT_QUOTE =
  "Making this world a better place by sharing love, empathy and happiness - one slice at a time.";
const DEFAULT_STATS = {
  years: "115+",
  customers: "50K+",
  recipes: "200+",
  baked: "24/7",
};

const bakerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    contactNumber: { type: String },
    myStory: { type: String, default: DEFAULT_STORY },
    storyQuote: { type: String, default: DEFAULT_QUOTE },
    statsYears: { type: String, default: DEFAULT_STATS.years },
    statsCustomers: { type: String, default: DEFAULT_STATS.customers },
    statsRecipes: { type: String, default: DEFAULT_STATS.recipes },
    statsBaked: { type: String, default: DEFAULT_STATS.baked },
    imageUrl: { type: String, default: "" },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
      approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved",
      },
  },
  { timestamps: true },
);

export default mongoose.model("Bakery", bakerySchema);