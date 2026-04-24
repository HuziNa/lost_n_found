import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Products.js";
import Category from "../models/Category.js";

dotenv.config({ path: "../.env" });

const professionalImages = {
  "PIZZA": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
  "CUPCAKE": "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=1200&auto=format&fit=crop",
  "BREAD": "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop"
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.DATABASE_CONNECTION_STRING);
    console.log("Connected to MongoDB");

    const products = await Product.find().populate("categoryId");
    let updatedCount = 0;

    for (const product of products) {
      if (!product.categoryId) continue;

      const catName = product.categoryId.name.toUpperCase();
      let newImage = null;

      if (catName.includes("PIZZA")) newImage = professionalImages.PIZZA;
      else if (catName.includes("CUPCAKE")) newImage = professionalImages.CUPCAKE;
      else if (catName.includes("BREAD")) newImage = professionalImages.BREAD;

      if (newImage && (!product.imageUrl || product.imageUrl.includes("placeholder") || product.imageUrl.includes("example.com"))) {
        product.imageUrl = newImage;
        await product.save();
        console.log(`Updated image for ${product.name} (${catName})`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} product images with professional photography.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating images:", error);
    process.exit(1);
  }
}

updateImages();
