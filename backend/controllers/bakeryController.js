import mongoose from "mongoose";
import Bakery from "../models/Bakery.js";
import BakeryInventory from "../models/BakeryInventory.js";
import Category from "../models/Category.js";
import GlobalCategory from "../models/GlobalCategory.js";
import Ingredient from "../models/Ingredients.js";
import Order from "../models/Order.js";
import ProductOption from "../models/ProductOption.js";
import Product from "../models/Products.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { ensureGlobalCategories } from "../utils/globalCategories.js";

const PRODUCT_TYPES = ["FIXED", "CUSTOMIZABLE"];

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

const toIdString = (value) => (value ? value.toString() : null);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildCategoryMap = async (categoryIds, bakeryId) => {
  const uniqueIds = [...new Set(categoryIds.filter(Boolean))];
  const map = new Map();

  if (uniqueIds.length === 0) {
    return map;
  }

  const globalCategories = await GlobalCategory.find({
    _id: { $in: uniqueIds },
  })
    .select("_id name")
    .lean();

  globalCategories.forEach((category) => {
    map.set(toIdString(category._id), category);
  });

  const missingIds = uniqueIds.filter((id) => !map.has(toIdString(id)));
  if (missingIds.length > 0) {
    const fallbackCategories = await Category.find({
      _id: { $in: missingIds },
      bakeryId,
    })
      .select("_id name")
      .lean();

    fallbackCategories.forEach((category) => {
      map.set(toIdString(category._id), category);
    });
  }

  return map;
};

const resolveCategoryById = async (categoryId, bakeryId) => {
  if (!categoryId) return null;

  const globalCategory = await GlobalCategory.findById(categoryId)
    .select("_id name")
    .lean();

  if (globalCategory) {
    return globalCategory;
  }

  if (!bakeryId) {
    return null;
  }

  return Category.findOne({ _id: categoryId, bakeryId })
    .select("_id name")
    .lean();
};

const ensureBakeryStoryDefaults = (bakeryDoc) => {
  if (!bakeryDoc) return false;
  let updated = false;

  if (!String(bakeryDoc.myStory || "").trim()) {
    bakeryDoc.myStory = DEFAULT_STORY;
    updated = true;
  }
  if (!String(bakeryDoc.storyQuote || "").trim()) {
    bakeryDoc.storyQuote = DEFAULT_QUOTE;
    updated = true;
  }
  if (!String(bakeryDoc.statsYears || "").trim()) {
    bakeryDoc.statsYears = DEFAULT_STATS.years;
    updated = true;
  }
  if (!String(bakeryDoc.statsCustomers || "").trim()) {
    bakeryDoc.statsCustomers = DEFAULT_STATS.customers;
    updated = true;
  }
  if (!String(bakeryDoc.statsRecipes || "").trim()) {
    bakeryDoc.statsRecipes = DEFAULT_STATS.recipes;
    updated = true;
  }
  if (!String(bakeryDoc.statsBaked || "").trim()) {
    bakeryDoc.statsBaked = DEFAULT_STATS.baked;
    updated = true;
  }

  return updated;
};

function serializeProduct(productDoc, options = []) {
  return {
    id: toIdString(productDoc._id),
    bakeryId: toIdString(productDoc.bakeryId),
    categoryId: toIdString(productDoc.categoryId),
    name: productDoc.name,
    type: productDoc.type,
    basePrice: productDoc.basePrice,
    description: productDoc.description || "",
    imageUrl: productDoc.imageUrl || "",
    ingredientsText: productDoc.ingredientsText || "",
    ingredients: productDoc.ingredients || [],
    allergens: productDoc.allergens || [],
    nutrition: productDoc.nutrition || {},
    selectedTemplate: productDoc.selectedTemplate || "",
    isActive: productDoc.isActive,
    options,
    createdAt: productDoc.createdAt,
    updatedAt: productDoc.updatedAt,
  };
}

function serializeOptions(optionDocs) {
  return optionDocs.map((option) => ({
    id: toIdString(option._id),
    productId: toIdString(option.productId),
    name: option.name,
    required: option.required,
    perLayer: option.perLayer,
    templateKey: option.templateKey,
    maxSelections: option.maxSelections,
    choices: option.choices.map((choice) => ({
      name: choice.name,
      ingredientId: toIdString(choice.ingredientId),
      quantity: choice.quantity,
      extraPrice: choice.extraPrice,
    })),
    createdAt: option.createdAt,
    updatedAt: option.updatedAt,
  }));
}

function serializeCategory(categoryDoc) {
  return {
    id: toIdString(categoryDoc._id),
    name: categoryDoc.name,
    globalCategoryId: toIdString(categoryDoc.globalCategoryId),
    isFeatured: categoryDoc.isFeatured || false,
    createdAt: categoryDoc.createdAt,
    updatedAt: categoryDoc.updatedAt,
  };
}

function serializePublicBakery(bakeryDoc) {
  return {
    id: toIdString(bakeryDoc._id),
    name: bakeryDoc.name,
    address: bakeryDoc.address,
    contactNumber: bakeryDoc.contactNumber,
    imageUrl: bakeryDoc.imageUrl || "",
    isActive: bakeryDoc.isActive,
    createdAt: bakeryDoc.createdAt,
    updatedAt: bakeryDoc.updatedAt,
  };
}

// API: GET /api/bakery/categories/public/:bakeryId
// Returns:
// - 200 with categories list ONLY for specific bakery (no globals)
export const listPublicBakeryCategories = async (req, res) => {
  try {
    const { bakeryId } = req.params;

    if (!isValidObjectId(bakeryId)) {
      return res.status(400).json({ message: "Invalid Bakery ID." });
    }

    const categories = await Category.find({ bakeryId })
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      message: "Categories fetched successfully.",
      categories: categories.map(serializeCategory),
    });
  } catch (error) {
    console.error("[Bakery Controller] listPublicBakeryCategories Error:", error);
    return res.status(500).json({
      message: "Error fetching categories.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/categories
// - Session cookie from /api/auth/login
// Returns:
// - 200 with categories list for owner's bakery (both global list for selection and current local ones)
export const listBakeryCategories = async (req, res) => {
  try {
    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const globals = await ensureGlobalCategories();
    console.log(`[Bakery Controller] Fetched ${globals.length} global categories.`);
    const localCategories = await Category.find({
      bakeryId: user.bakeryManaged._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Bakery categories fetched successfully.",
      globals: globals.map((g) => ({ id: toIdString(g._id), name: g.name })),
      categories: localCategories.map(serializeCategory),
    });
  } catch (error) {
    console.error('[Bakery Controller] listBakeryCategories Error:', error);
    return res.status(500).json({
      message: "Error fetching bakery categories.",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// API: POST /api/bakery/categories
// - Session cookie from /api/auth/login
// - Body: { name: String, globalCategoryId: String, isFeatured?: Boolean }
// Returns:
// - 201 with created category
export const createBakeryCategory = async (req, res) => {
  try {
    const { name, globalCategoryId, isFeatured } = req.body;

    if (!name || !globalCategoryId) {
      return res.status(400).json({
        message: "name and globalCategoryId are required.",
      });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    // Verify global category exists
    const globalCat = await GlobalCategory.findById(globalCategoryId);
    if (!globalCat) {
      return res.status(400).json({
        message: "Invalid globalCategoryId.",
      });
    }

    const category = await Category.create({
      bakeryId: user.bakeryManaged._id,
      name: name.trim(),
      globalCategoryId,
      isFeatured: !!isFeatured,
    });

    return res.status(201).json({
      message: "Category created successfully.",
      category: serializeCategory(category),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating category.",
      error: error.message,
    });
  }
};

// API: PATCH /api/bakery/profile
// - Session cookie from /api/auth/login
// - Body: { myStory?: String, storyQuote?: String, statsYears?: String, statsCustomers?: String, statsRecipes?: String, statsBaked?: String, imageUrl?: String }
// Returns:
// - 200 with updated bakery profile
export const updateBakeryProfile = async (req, res) => {
  try {
    const {
      myStory,
      storyQuote,
      statsYears,
      statsCustomers,
      statsRecipes,
      statsBaked,
      imageUrl,
    } = req.body;

    if (
      myStory === undefined &&
      storyQuote === undefined &&
      statsYears === undefined &&
      statsCustomers === undefined &&
      statsRecipes === undefined &&
      statsBaked === undefined &&
      imageUrl === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required: myStory, storyQuote, statsYears, statsCustomers, statsRecipes, statsBaked, imageUrl.",
      });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    if (myStory !== undefined) {
      user.bakeryManaged.myStory = String(myStory || "").trim();
    }
    if (storyQuote !== undefined) {
      user.bakeryManaged.storyQuote = String(storyQuote || "").trim();
    }
    if (statsYears !== undefined) {
      user.bakeryManaged.statsYears = String(statsYears || "").trim();
    }
    if (statsCustomers !== undefined) {
      user.bakeryManaged.statsCustomers = String(statsCustomers || "").trim();
    }
    if (statsRecipes !== undefined) {
      user.bakeryManaged.statsRecipes = String(statsRecipes || "").trim();
    }
    if (statsBaked !== undefined) {
      user.bakeryManaged.statsBaked = String(statsBaked || "").trim();
    }
    if (imageUrl !== undefined) {
      user.bakeryManaged.imageUrl = String(imageUrl || "").trim();
    }
    await user.bakeryManaged.save();

    return res.status(200).json({
      message: "Bakery profile updated successfully.",
      bakery: {
        id: toIdString(user.bakeryManaged._id),
        name: user.bakeryManaged.name,
        address: user.bakeryManaged.address || null,
        contactNumber: user.bakeryManaged.contactNumber || null,
        myStory: user.bakeryManaged.myStory || "",
        storyQuote: user.bakeryManaged.storyQuote || "",
        statsYears: user.bakeryManaged.statsYears || "",
        statsCustomers: user.bakeryManaged.statsCustomers || "",
        statsRecipes: user.bakeryManaged.statsRecipes || "",
        statsBaked: user.bakeryManaged.statsBaked || "",
        imageUrl: user.bakeryManaged.imageUrl || "",
        isActive: user.bakeryManaged.isActive,
        approvalStatus: user.bakeryManaged.approvalStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating bakery profile.",
      error: error.message,
    });
  }
};

// API: PATCH /api/bakery/categories/:categoryId
// - Session cookie from /api/auth/login
// - Body: { name?: String, globalCategoryId?: String, isFeatured?: Boolean }
// Returns:
// - 200 with updated category
export const updateBakeryCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, globalCategoryId, isFeatured } = req.body;

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      bakeryId: user.bakeryManaged._id,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found in your bakery.",
      });
    }

    if (name) category.name = name.trim();
    if (globalCategoryId) {
      const globalCat = await GlobalCategory.findById(globalCategoryId);
      if (!globalCat) {
        return res.status(400).json({ message: "Invalid globalCategoryId." });
      }
      category.globalCategoryId = globalCategoryId;
    }
    if (isFeatured !== undefined) category.isFeatured = !!isFeatured;

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully.",
      category: serializeCategory(category),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating category.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/ingredients
// - Session cookie from /api/auth/login
// Returns:
// - 200 with ingredients list for owner's bakery
export const listBakeryIngredients = async (req, res) => {
  try {
    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const ingredients = await Ingredient.find({
      bakeryId: user.bakeryManaged._id,
    })
      .select("_id name unit pricePerUnit stock minStock isActive recipe createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    const serializedIngredients = ingredients.map((ingredient) => ({
      id: toIdString(ingredient._id),
      name: ingredient.name,
      unit: ingredient.unit,
      pricePerUnit: ingredient.pricePerUnit,
      stock: ingredient.stock,
      minStock: ingredient.minStock,
      isActive: ingredient.isActive,
      recipe: ingredient.recipe || [],
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    }));

    return res.status(200).json({
      message: "Bakery ingredients fetched successfully.",
      ingredients: serializedIngredients,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery ingredients.",
      error: error.message,
    });
  }
};

// API: POST /api/bakery/ingredients
// - Session cookie from /api/auth/login
// - Body: { name: String, unit: String, pricePerUnit: Number, stock: Number, minStock: Number }
// Returns:
// - 201 with created ingredient
export const createBakeryIngredient = async (req, res) => {
  try {
    const { name, unit, pricePerUnit, stock, minStock } = req.body;

    if (!name || !unit || pricePerUnit === undefined) {
      return res.status(400).json({
        message: "name, unit, and pricePerUnit are required.",
      });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    // Check for duplicate ingredient name in this bakery
    const existingIngredient = await Ingredient.findOne({
      bakeryId: user.bakeryManaged._id,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingIngredient) {
      return res.status(409).json({
        message: "An ingredient with this name already exists in your bakery.",
      });
    }

    const ingredient = await Ingredient.create({
      bakeryId: user.bakeryManaged._id,
      name: name.trim(),
      unit: unit.trim(),
      pricePerUnit: Number(pricePerUnit),
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
    });

    const serializedIngredient = {
      id: toIdString(ingredient._id),
      name: ingredient.name,
      unit: ingredient.unit,
      pricePerUnit: ingredient.pricePerUnit,
      stock: ingredient.stock,
      minStock: ingredient.minStock,
      isActive: ingredient.isActive,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };

    return res.status(201).json({
      message: "Ingredient created successfully.",
      ingredient: serializedIngredient,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating ingredient.",
      error: error.message,
    });
  }
};

// API: PATCH /api/bakery/ingredients/:ingredientId
// - Session cookie from /api/auth/login
// - Body: { name?, unit?, pricePerUnit?, stock?, minStock?, isActive?, recipe? }
export const updateBakeryIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(ingredientId)) {
      return res.status(400).json({ message: "Invalid ingredientId." });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");
    if (!user || !user.bakeryManaged) {
      return res.status(404).json({ message: "Bakery not found." });
    }

    const ingredient = await Ingredient.findOne({
      _id: ingredientId,
      bakeryId: user.bakeryManaged._id,
    });

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found." });
    }

    if (updateData.name) ingredient.name = updateData.name.trim();
    if (updateData.unit) ingredient.unit = updateData.unit.trim();
    if (updateData.pricePerUnit !== undefined) ingredient.pricePerUnit = Number(updateData.pricePerUnit);
    if (updateData.stock !== undefined) ingredient.stock = Number(updateData.stock);
    if (updateData.minStock !== undefined) ingredient.minStock = Number(updateData.minStock);
    if (updateData.isActive !== undefined) ingredient.isActive = !!updateData.isActive;
    if (updateData.recipe) ingredient.recipe = updateData.recipe;

    await ingredient.save();

    return res.status(200).json({
      message: "Ingredient updated successfully.",
      ingredient: {
        id: toIdString(ingredient._id),
        name: ingredient.name,
        unit: ingredient.unit,
        pricePerUnit: ingredient.pricePerUnit,
        stock: ingredient.stock,
        minStock: ingredient.minStock,
        isActive: ingredient.isActive,
        recipe: ingredient.recipe || [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating ingredient.", error: error.message });
  }
};

// API: DELETE /api/bakery/ingredients/:ingredientId
export const deleteBakeryIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;

    if (!isValidObjectId(ingredientId)) {
      return res.status(400).json({ message: "Invalid ingredientId." });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");
    if (!user || !user.bakeryManaged) {
      return res.status(404).json({ message: "Bakery not found." });
    }

    const result = await Ingredient.deleteOne({
      _id: ingredientId,
      bakeryId: user.bakeryManaged._id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Ingredient not found." });
    }

    return res.status(200).json({ message: "Ingredient deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting ingredient.", error: error.message });
  }
};

// API: GET /api/bakery/products
// - Session cookie from /api/auth/login
// Returns:
// - 200 with products list for owner's bakery
export const listBakeryProducts = async (req, res) => {
  try {
    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const products = await Product.find({
      bakeryId: user.bakeryManaged._id,
    }).sort({ createdAt: -1 }).lean();

    const productIds = products.map((product) => product._id);
    const productOptions = await ProductOption.find({
      productId: { $in: productIds },
    }).lean();

    const optionsByProductId = new Map();
    for (const option of productOptions) {
      const productId = toIdString(option.productId);
      if (!optionsByProductId.has(productId)) {
        optionsByProductId.set(productId, []);
      }
      optionsByProductId.get(productId).push(option);
    }

    const serializedProducts = products.map((product) => {
      const options = optionsByProductId.get(toIdString(product._id)) || [];
      return serializeProduct(product, serializeOptions(options));
    });

    return res.status(200).json({
      message: "Bakery products fetched successfully.",
      products: serializedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery products.",
      error: error.message,
    });
  }
};

// API: POST /api/bakery/products
// - Session cookie from /api/auth/login
// - Body: complex product creation data
// Returns:
// - 201 with created product + options
export const createBakeryProduct = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      type,
      basePrice,
      description,
      imageUrl,
      ingredientsText,
      ingredients,
      allergens,
      nutrition,
      options,
    } = req.body;

    // Validation
    if (!categoryId || !name || !type || basePrice === undefined) {
      return res.status(400).json({
        message: "categoryId, name, type, and basePrice are required.",
      });
    }

    if (!PRODUCT_TYPES.includes(type)) {
      return res.status(400).json({
        message: `type must be one of: ${PRODUCT_TYPES.join(", ")}.`,
      });
    }

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        message: "categoryId must be a valid id.",
      });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    // Verify category belongs to this bakery
    const category = await Category.findOne({
      _id: categoryId,
      bakeryId: user.bakeryManaged._id,
    }).lean();

    if (!category) {
      return res.status(400).json({
        message: "Category not found in your bakery catalog. Please link it to a global type first.",
      });
    }

    // Check for duplicate product name
    const existingProduct = await Product.findOne({
      bakeryId: user.bakeryManaged._id,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingProduct) {
      return res.status(409).json({
        message: "A product with this name already exists in your bakery.",
      });
    }

    // Validate ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      for (const ingredient of ingredients) {
        if (!ingredient.ingredientId || ingredient.quantity === undefined) {
          return res.status(400).json({
            message: "Each ingredient must have ingredientId and quantity.",
          });
        }

        if (!isValidObjectId(ingredient.ingredientId)) {
          return res.status(400).json({
            message: "ingredientId must be a valid id.",
          });
        }

        // Verify ingredient belongs to this bakery
        const ingredientDoc = await Ingredient.findOne({
          _id: ingredient.ingredientId,
          bakeryId: user.bakeryManaged._id,
        });

        if (!ingredientDoc) {
          return res.status(400).json({
            message: `Ingredient with id ${ingredient.ingredientId} not found in your bakery.`,
          });
        }
      }
    }

    // Validate options if provided and type is CUSTOMIZABLE
    if (type === "CUSTOMIZABLE" && options && Array.isArray(options)) {
      for (const option of options) {
        if (!option.name || !option.choices || !Array.isArray(option.choices)) {
          return res.status(400).json({
            message: "Each option must have name and choices array.",
          });
        }

        for (const choice of option.choices) {
          if (!choice.name || !choice.ingredientId || choice.quantity === undefined) {
            return res.status(400).json({
              message: "Each choice must have name, ingredientId, and quantity.",
            });
          }

          if (!isValidObjectId(choice.ingredientId)) {
            return res.status(400).json({
              message: "choice.ingredientId must be a valid id.",
            });
          }

          // Verify ingredient belongs to this bakery
          const ingredientDoc = await Ingredient.findOne({
            _id: choice.ingredientId,
            bakeryId: user.bakeryManaged._id,
          });

          if (!ingredientDoc) {
            return res.status(400).json({
              message: `Ingredient with id ${choice.ingredientId} not found in your bakery.`,
            });
          }
        }
      }
    }

    // Create product
    const product = await Product.create({
      bakeryId: user.bakeryManaged._id,
      categoryId,
      name: name.trim(),
      type,
      basePrice: Number(basePrice),
      description: description ? String(description).trim() : "",
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
      ingredientsText: ingredientsText ? String(ingredientsText).trim() : "",
      ingredients: ingredients || [],
      allergens: allergens || [],
      nutrition: nutrition || {},
    });

    // Create options if provided
    let createdOptions = [];
    if (type === "CUSTOMIZABLE" && options && Array.isArray(options)) {
      for (const optionData of options) {
        const option = await ProductOption.create({
          productId: product._id,
          name: optionData.name.trim(),
          required: optionData.required || false,
          perLayer: optionData.perLayer || false,
          templateKey: optionData.templateKey || null,
          maxSelections: optionData.maxSelections || null,
          choices: optionData.choices.map((choice) => ({
            name: choice.name.trim(),
            ingredientId: choice.ingredientId,
            quantity: Number(choice.quantity),
            extraPrice: Number(choice.extraPrice) || 0,
          })),
        });
        createdOptions.push(option);
      }
    }

    const serializedProduct = serializeProduct(product, serializeOptions(createdOptions));

    return res.status(201).json({
      message: "Product created successfully.",
      product: serializedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating product.",
      error: error.message,
    });
  }
};

// API: PATCH /api/bakery/products/:productId
// - Session cookie from /api/auth/login
// - Body: various update fields
// Returns:
// - 200 with updated product + options
export const updateBakeryProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        message: "productId must be a valid id.",
      });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      bakeryId: user.bakeryManaged._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found in your bakery.",
      });
    }

    // Handle categoryId update
    if (updateData.categoryId) {
      if (!isValidObjectId(updateData.categoryId)) {
        return res.status(400).json({
          message: "categoryId must be a valid id.",
        });
      }

      const category = await Category.findOne({
        _id: updateData.categoryId,
        bakeryId: user.bakeryManaged._id,
      }).lean();

      if (!category) {
        return res.status(400).json({
          message: "Category not found in your bakery catalog.",
        });
      }
    }

    // Handle name update with duplicate check
    if (updateData.name) {
      const existingProduct = await Product.findOne({
        bakeryId: user.bakeryManaged._id,
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        _id: { $ne: productId },
      });

      if (existingProduct) {
        return res.status(409).json({
          message: "A product with this name already exists in your bakery.",
        });
      }
    }

    // Handle type update
    if (updateData.type && !PRODUCT_TYPES.includes(updateData.type)) {
      return res.status(400).json({
        message: `type must be one of: ${PRODUCT_TYPES.join(", ")}.`,
      });
    }

    // Handle ingredients update
    if (updateData.ingredients && Array.isArray(updateData.ingredients)) {
      for (const ingredient of updateData.ingredients) {
        if (!ingredient.ingredientId || ingredient.quantity === undefined) {
          return res.status(400).json({
            message: "Each ingredient must have ingredientId and quantity.",
          });
        }

        if (!isValidObjectId(ingredient.ingredientId)) {
          return res.status(400).json({
            message: "ingredientId must be a valid id.",
          });
        }

        const ingredientDoc = await Ingredient.findOne({
          _id: ingredient.ingredientId,
          bakeryId: user.bakeryManaged._id,
        });

        if (!ingredientDoc) {
          return res.status(400).json({
            message: `Ingredient with id ${ingredient.ingredientId} not found in your bakery.`,
          });
        }
      }
    }

    // Handle options update
    if (updateData.options && Array.isArray(updateData.options)) {
      // Delete existing options
      await ProductOption.deleteMany({ productId });

      // Create new options
      for (const optionData of updateData.options) {
        if (!optionData.name || !optionData.choices || !Array.isArray(optionData.choices)) {
          return res.status(400).json({
            message: "Each option must have name and choices array.",
          });
        }

        for (const choice of optionData.choices) {
          if (!choice.name || !choice.ingredientId || choice.quantity === undefined) {
            return res.status(400).json({
              message: "Each choice must have name, ingredientId, and quantity.",
            });
          }

          if (!isValidObjectId(choice.ingredientId)) {
            return res.status(400).json({
              message: "choice.ingredientId must be a valid id.",
            });
          }

          const ingredientDoc = await Ingredient.findOne({
            _id: choice.ingredientId,
            bakeryId: user.bakeryManaged._id,
          });

          if (!ingredientDoc) {
            return res.status(400).json({
              message: `Ingredient with id ${choice.ingredientId} not found in your bakery.`,
            });
          }
        }

        await ProductOption.create({
          productId,
          name: optionData.name.trim(),
          required: optionData.required || false,
          perLayer: optionData.perLayer || false,
          templateKey: optionData.templateKey || null,
          maxSelections: optionData.maxSelections || null,
          choices: optionData.choices.map((choice) => ({
            name: choice.name.trim(),
            ingredientId: choice.ingredientId,
            quantity: Number(choice.quantity),
            extraPrice: Number(choice.extraPrice) || 0,
          })),
        });
      }
    }

    // Update product
    if (updateData.description !== undefined) {
      product.description = String(updateData.description || "").trim();
    }

    if (updateData.imageUrl !== undefined) {
      product.imageUrl = String(updateData.imageUrl || "").trim();
    }

    if (updateData.ingredientsText !== undefined) {
      product.ingredientsText = String(updateData.ingredientsText || "").trim();
    }

    const safeUpdateData = { ...updateData };
    delete safeUpdateData.description;
    delete safeUpdateData.imageUrl;
    delete safeUpdateData.ingredientsText;

    Object.assign(product, safeUpdateData);
    await product.save();

    // Get updated options
    const options = await ProductOption.find({ productId }).lean();

    const serializedProduct = serializeProduct(product, serializeOptions(options));

    return res.status(200).json({
      message: "Product updated successfully.",
      product: serializedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating product.",
      error: error.message,
    });
  }
};

// API: DELETE /api/bakery/products/:productId
// - Session cookie from /api/auth/login
// Returns:
// - 200 with success message
export const deleteBakeryProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        message: "productId must be a valid id.",
      });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      bakeryId: user.bakeryManaged._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found in your bakery.",
      });
    }

    // Delete associated options
    await ProductOption.deleteMany({ productId });

    // Delete product
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting product.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/public
// - Public endpoint (no session required)
// Returns:
// - 200 with approved, active bakeries
export const listPublicBakeries = async (req, res) => {
  try {
    const bakeries = await Bakery.find({
      isActive: true,
      approvalStatus: "approved",
    })
      .sort({ createdAt: -1 })
      .select("_id name address contactNumber imageUrl isActive createdAt updatedAt")
      .lean();

    return res.status(200).json({
      message: "Public bakeries fetched successfully.",
      bakeries: bakeries.map(serializePublicBakery),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching public bakeries.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/menu/:bakeryId/products
// - Public endpoint (no session required)
// Returns:
// - 200 with bakery menu products
export const getBakeryMenuProductsByBakeryId = async (req, res) => {
  try {
    const { bakeryId } = req.params;

    if (!bakeryId || !isValidObjectId(bakeryId)) {
      return res.status(400).json({
        message: "bakeryId must be a valid id.",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const bakeryDoc = await Bakery.findOne({
      _id: bakeryId,
      isActive: true,
    }).select("_id name address isActive myStory storyQuote statsYears statsCustomers statsRecipes statsBaked imageUrl");

    if (!bakeryDoc) {
      return res.status(404).json({
        message: "Bakery not found or inactive.",
      });
    }

    if (ensureBakeryStoryDefaults(bakeryDoc)) {
      await bakeryDoc.save();
    }

    const bakery = bakeryDoc.toObject();

    const filter = {
      bakeryId: bakery._id,
      isActive: true,
    };

    if (req.query.categoryId !== undefined) {
      const categoryId = String(req.query.categoryId);
      if (!isValidObjectId(categoryId)) {
        return res.status(400).json({
          message: "categoryId must be a valid id when provided.",
        });
      }

      filter.categoryId = categoryId;
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const productIds = products.map((product) => product._id);
    const optionDocs = await ProductOption.find({
      productId: { $in: productIds },
    }).lean();

    const optionsByProductId = new Map();
    for (const option of optionDocs) {
      const productId = toIdString(option.productId);
      if (!optionsByProductId.has(productId)) {
        optionsByProductId.set(productId, []);
      }
      optionsByProductId.get(productId).push(option);
    }

    const categoryIds = [
      ...new Set(products.map((product) => toIdString(product.categoryId))),
    ];

    const categoryById = await buildCategoryMap(categoryIds, bakery._id);

    const serializedProducts = products.map((product) => {
      const serializedProduct = serializeProduct(
        product,
        serializeOptions(optionsByProductId.get(toIdString(product._id)) || []),
      );

      const category = categoryById.get(toIdString(product.categoryId));
      serializedProduct.category = category
        ? {
            id: toIdString(category._id),
            name: category.name,
          }
        : null;

      return serializedProduct;
    });

    return res.status(200).json({
      message: "Bakery menu products fetched successfully.",
      bakery: {
        id: toIdString(bakery._id),
        name: bakery.name,
        address: bakery.address || "",
        isActive: bakery.isActive,
        myStory: bakery.myStory || "",
        storyQuote: bakery.storyQuote || "",
        statsYears: bakery.statsYears || "",
        statsCustomers: bakery.statsCustomers || "",
        statsRecipes: bakery.statsRecipes || "",
        statsBaked: bakery.statsBaked || "",
        imageUrl: bakery.imageUrl || "",
      },
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products: serializedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery menu products.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/products/:productId
// - Public endpoint (no session required)
// Returns:
// - 200 with product details for menu rendering
export const getBakeryMenuProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        message: "productId must be a valid id.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found or inactive.",
      });
    }

    const bakeryDoc = await Bakery.findOne({
      _id: product.bakeryId,
      isActive: true,
    }).select("_id name address isActive myStory storyQuote statsYears statsCustomers statsRecipes statsBaked imageUrl");

    if (!bakeryDoc) {
      return res.status(404).json({
        message: "Bakery for this product was not found or inactive.",
      });
    }

    if (ensureBakeryStoryDefaults(bakeryDoc)) {
      await bakeryDoc.save();
    }

    const bakery = bakeryDoc.toObject();

    const category = await resolveCategoryById(product.categoryId, bakery._id);

    const optionDocs =
      product.type === "CUSTOMIZABLE"
        ? await ProductOption.find({ productId: product._id }).lean()
        : [];

    const serializedProduct = serializeProduct(
      product,
      serializeOptions(optionDocs),
    );

    if (serializedProduct.ingredients?.length > 0) {
      const ingredientIds = serializedProduct.ingredients
        .map((item) => item.ingredientId)
        .filter((value) => value && isValidObjectId(value));

      const ingredientDocs = ingredientIds.length
        ? await Ingredient.find({ _id: { $in: ingredientIds }, bakeryId: bakery._id })
            .select("_id name unit")
            .lean()
        : [];

      const ingredientMap = new Map(
        ingredientDocs.map((item) => [toIdString(item._id), item]),
      );

      serializedProduct.ingredients = serializedProduct.ingredients.map((item) => {
        const ingredientMeta = ingredientMap.get(item.ingredientId);
        return {
          ...item,
          name: ingredientMeta?.name || "",
          unit: ingredientMeta?.unit || "",
        };
      });
    }

    // Add stock checking for product options (bespoke features)
    if (serializedProduct.options?.length > 0) {
      const choiceIngredientIds = [];
      serializedProduct.options.forEach((opt) => {
        opt.choices.forEach((choice) => {
          if (choice.ingredientId && isValidObjectId(choice.ingredientId)) {
            choiceIngredientIds.push(choice.ingredientId);
          }
        });
      });

      if (choiceIngredientIds.length > 0) {
        const ingredientStocks = await Ingredient.find({
          _id: { $in: choiceIngredientIds },
          bakeryId: bakery._id,
        })
          .select("_id stock")
          .lean();

        const stockMap = new Map(
          ingredientStocks.map((item) => [toIdString(item._id), item.stock]),
        );

        serializedProduct.options = serializedProduct.options.map((opt) => ({
          ...opt,
          choices: opt.choices.map((choice) => ({
            ...choice,
            inStock: (stockMap.get(choice.ingredientId) ?? 1) > 0,
          })),
        }));
      }
    }

    serializedProduct.bakery = {
      id: toIdString(bakery._id),
      name: bakery.name,
      isActive: bakery.isActive,
      myStory: bakery.myStory || "",
      storyQuote: bakery.storyQuote || "",
      statsYears: bakery.statsYears || "",
      statsCustomers: bakery.statsCustomers || "",
      statsRecipes: bakery.statsRecipes || "",
      statsBaked: bakery.statsBaked || "",
      imageUrl: bakery.imageUrl || "",
    };

    serializedProduct.category = category
      ? {
          id: toIdString(category._id),
          name: category.name,
        }
      : null;

    return res.status(200).json({
      message: "Product details fetched successfully.",
      product: serializedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching product details.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/orders
// - Session cookie from /api/auth/login
// Returns:
// - 200 with owner bakery orders
export const listBakeryPastOrders = async (req, res) => {
  try {
    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {
      bakeryId: user.bakeryManaged._id,
    };

    if (req.query.status) {
      const status = String(req.query.status).toLowerCase();
      if (!["pending", "baking", "ready", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          message: "status must be one of: pending, baking, ready, completed, cancelled.",
        });
      }
      filter.status = status;
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email contactNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const serializedOrders = orders.map((order) => ({
      id: toIdString(order._id),
      customer: order.userId
        ? {
            id: toIdString(order.userId._id),
            name: order.userId.name,
            email: order.userId.email,
            contactNumber: order.userId.contactNumber,
          }
        : null,
      items: (order.items || []).map((item) => ({
        productId: toIdString(item.productId),
        productName: item.productName || "",
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        selectedOptions: item.selectedOptions || [],
      })),
      totalAmount: order.totalAmount ?? order.totalPrice,
      totalPrice: order.totalPrice,
      status: order.status,
      specialInstructions:
        order.specialInstructions || order.deliveryInstructions || "",
      deliveryOption: order.deliveryOption,
      deliveryFee: order.deliveryFee,
      customerPhone: order.customerPhone,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return res.status(200).json({
      message: "Bakery orders fetched successfully.",
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders: serializedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery orders.",
      error: error.message,
    });
  }
};

// API: PATCH /api/bakery/orders/:orderId/status
// - Session cookie from /api/auth/login
// - Body: { status: String }
// Returns:
// - 200 with updated order
export const updateBakeryOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !isValidObjectId(orderId)) {
      return res.status(400).json({
        message: "orderId must be a valid id.",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "status is required.",
      });
    }

    const validStatuses = ["pending", "baking", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}.`,
      });
    }

    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      bakeryId: user.bakeryManaged._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found in your bakery.",
      });
    }

    order.status = status.toLowerCase();
    await order.save();

    const serializedOrder = {
      id: toIdString(order._id),
      customer: order.customerId
        ? {
            id: toIdString(order.customerId),
            name: order.customerId.name,
            email: order.customerId.email,
            contactNumber: order.customerId.contactNumber,
          }
        : null,
      items: order.items.map((item) => ({
        productId: toIdString(item.productId),
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        selectedOptions: item.selectedOptions || [],
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      specialInstructions: order.specialInstructions,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return res.status(200).json({
      message: "Order status updated successfully.",
      order: serializedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating order status.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/analytics
// - Session cookie from /api/auth/login
// Returns:
// - 200 with bakery analytics
export const getBakeryAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.authUser.id).populate("bakeryManaged");

    if (!user || !user.bakeryManaged) {
      return res.status(404).json({
        message: "Bakery not found for this owner.",
      });
    }

    const bakeryId = user.bakeryManaged._id;

    // Get date range (default to last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Total orders
    const totalOrders = await Order.countDocuments({
      bakeryId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          bakeryId,
          status: { $in: ["completed", "ready"] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          bakeryId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {};
    ordersByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    // Top products
    const topProducts = await Order.aggregate([
      {
        $match: {
          bakeryId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.status(200).json({
      message: "Bakery analytics fetched successfully.",
      analytics: {
        period: {
          startDate,
          endDate,
        },
        totalOrders,
        totalRevenue,
        ordersByStatus: statusCounts,
        topProducts: topProducts.map((product) => ({
          productId: toIdString(product._id),
          productName: product.productName,
          totalSold: product.totalSold,
          totalRevenue: product.totalRevenue,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery analytics.",
      error: error.message,
    });
  }
};

// API: POST /api/bakery/reviews
// - Session cookie from /api/auth/login
// - Body: { bakeryId: String, rating: Number, comment: String }
// Returns:
// - 201 with created review
export const createBakeryReview = async (req, res) => {
  try {
    const { bakeryId, rating, comment } = req.body;

    if (!bakeryId || rating === undefined) {
      return res.status(400).json({
        message: "bakeryId and rating are required.",
      });
    }

    if (!isValidObjectId(bakeryId)) {
      return res.status(400).json({
        message: "bakeryId must be a valid id.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "rating must be between 1 and 5.",
      });
    }

    const user = await User.findById(req.authUser.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const bakery = await Bakery.findOne({
      _id: bakeryId,
      isActive: true,
    });

    if (!bakery) {
      return res.status(404).json({
        message: "Bakery not found or inactive.",
      });
    }

    // Check if user already reviewed this bakery
    const existingReview = await Review.findOne({
      bakeryId,
      userId: user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this bakery.",
      });
    }

    const review = await Review.create({
      bakeryId,
      userId: user._id,
      rating: Number(rating),
      comment: comment ? comment.trim() : "",
    });

    const serializedReview = {
      id: toIdString(review._id),
      bakeryId: toIdString(review.bakeryId),
      userId: toIdString(review.userId),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    return res.status(201).json({
      message: "Review created successfully.",
      review: serializedReview,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating review.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/reviews
// - Public endpoint (no session required)
// - Query param: bakeryId (required)
// Returns:
// - 200 with bakery reviews
export const listBakeryReviews = async (req, res) => {
  try {
    const { bakeryId } = req.query;

    if (!bakeryId || !isValidObjectId(bakeryId)) {
      return res.status(400).json({
        message: "bakeryId query parameter is required and must be a valid id.",
      });
    }

    const bakeryObjectId = new mongoose.Types.ObjectId(bakeryId);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const bakery = await Bakery.findOne({
      _id: bakeryId,
      isActive: true,
    })
      .select("_id name isActive")
      .lean();

    if (!bakery) {
      return res.status(404).json({
        message: "Bakery not found or inactive.",
      });
    }

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ bakeryId: bakeryObjectId })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ bakeryId: bakeryObjectId }),
    ]);

    const serializedReviews = reviews.map((review) => ({
      id: toIdString(review._id),
      bakeryId: toIdString(review.bakeryId),
      customer: review.userId
        ? {
            id: toIdString(review.userId._id),
            name: review.userId.name,
          }
        : null,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    // Calculate average rating
    const ratingResult = await Review.aggregate([
      { $match: { bakeryId: bakeryObjectId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = ratingResult.length > 0 ? ratingResult[0].averageRating : 0;

    return res.status(200).json({
      message: "Bakery reviews fetched successfully.",
      bakery: {
        id: toIdString(bakery._id),
        name: bakery.name,
        isActive: bakery.isActive,
      },
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      averageRating: Number(averageRating.toFixed(1)),
      reviews: serializedReviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery reviews.",
      error: error.message,
    });
  }
};