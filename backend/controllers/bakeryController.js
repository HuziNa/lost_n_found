import mongoose from "mongoose";
import Bakery from "../models/Bakery.js";
import BakeryInventory from "../models/BakeryInventory.js";
import Category from "../models/Category.js";
import Ingredient from "../models/Ingredients.js";
import Order from "../models/Order.js";
import ProductOption from "../models/ProductOption.js";
import Product from "../models/Products.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

const OWNER_ROLE = "bakeryOwner";
const PRODUCT_TYPES = ["FIXED", "CUSTOMIZABLE"];
const INGREDIENT_TYPES = ["RAW", "COMPOUND"];
const ORDER_STATUSES = ["pending", "completed"];
const ALLOWED_UNITS = ["g", "ml", "pcs"];

const toIdString = (value) => (value ? value.toString() : null);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeStringArray = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);
};

const normalizeNutrition = (nutrition) => {
  if (nutrition === undefined) {
    return { value: undefined };
  }

  if (nutrition === null) {
    return { value: null };
  }

  if (typeof nutrition !== "object" || Array.isArray(nutrition)) {
    return { error: "nutrition must be an object when provided." };
  }

  const nutritionKeys = [
    "calories",
    "protein",
    "carbohydrates",
    "fats",
    "sugar",
    "fiber",
  ];

  const normalizedNutrition = {};

  for (const key of nutritionKeys) {
    if (nutrition[key] === undefined) {
      continue;
    }

    const numericValue = Number(nutrition[key]);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return { error: `nutrition.${key} must be a non-negative number.` };
    }

    normalizedNutrition[key] = numericValue;
  }

  return { value: normalizedNutrition };
};

const serializeIngredient = (ingredientDoc, quantityAvailable = 0) => ({
  id: toIdString(ingredientDoc._id),
  bakeryId: toIdString(ingredientDoc.bakeryId),
  name: ingredientDoc.name,
  unit: ingredientDoc.unit,
  pricePerUnit: ingredientDoc.pricePerUnit,
  ingredientType:
    ingredientDoc.recipe && ingredientDoc.recipe.length > 0
      ? "COMPOUND"
      : "RAW",
  recipe: (ingredientDoc.recipe || []).map((entry) => ({
    ingredientId: toIdString(entry.ingredientId),
    quantity: entry.quantity,
  })),
  quantityAvailable,
  createdAt: ingredientDoc.createdAt,
  updatedAt: ingredientDoc.updatedAt,
});

const serializeProduct = (productDoc, options = []) => ({
  id: toIdString(productDoc._id),
  bakeryId: toIdString(productDoc.bakeryId),
  categoryId: toIdString(productDoc.categoryId),
  name: productDoc.name,
  type: productDoc.type,
  basePrice: productDoc.basePrice,
  ingredients: (productDoc.ingredients || []).map((entry) => ({
    ingredientId: toIdString(entry.ingredientId),
    quantity: entry.quantity,
  })),
  allergens: productDoc.allergens || [],
  nutrition: productDoc.nutrition || null,
  isActive: productDoc.isActive,
  options,
  createdAt: productDoc.createdAt,
  updatedAt: productDoc.updatedAt,
});

const serializeOptions = (optionDocs) =>
  optionDocs.map((option) => ({
    id: toIdString(option._id),
    productId: toIdString(option.productId),
    name: option.name,
    required: option.required,
    perLayer: option.perLayer,
    maxSelections: option.maxSelections,
    choices: (option.choices || []).map((choice) => ({
      name: choice.name,
      ingredientId: toIdString(choice.ingredientId),
      quantity: choice.quantity,
      extraPrice: choice.extraPrice,
    })),
    createdAt: option.createdAt,
    updatedAt: option.updatedAt,
  }));

const serializeReview = (reviewDoc) => ({
  id: toIdString(reviewDoc._id),
  userId: reviewDoc.userId?._id
    ? toIdString(reviewDoc.userId._id)
    : toIdString(reviewDoc.userId),
  user: reviewDoc.userId?._id
    ? {
        id: toIdString(reviewDoc.userId._id),
        name: reviewDoc.userId.name,
        email: reviewDoc.userId.email,
        contactNumber: reviewDoc.userId.contactNumber,
      }
    : null,
  bakeryId: toIdString(reviewDoc.bakeryId),
  rating: reviewDoc.rating,
  comment: reviewDoc.comment,
  isHidden: reviewDoc.isHidden,
  createdAt: reviewDoc.createdAt,
  updatedAt: reviewDoc.updatedAt,
});

const getOwnerBakeryContext = async (authUserId) => {
  const user = await User.findById(authUserId).select("_id role bakeryManaged");

  if (!user) {
    return { error: { status: 404, message: "User not found." } };
  }

  if (user.role !== OWNER_ROLE) {
    return {
      error: {
        status: 403,
        message: "Only bakery owners can manage bakery data.",
      },
    };
  }

  if (!user.bakeryManaged) {
    return {
      error: {
        status: 400,
        message:
          "No managed bakery found for this owner. Complete owner setup first.",
      },
    };
  }

  const bakery = await Bakery.findOne({
    _id: user.bakeryManaged,
    ownerId: user._id,
  });

  if (!bakery) {
    return {
      error: {
        status: 404,
        message: "Managed bakery not found.",
      },
    };
  }

  return { user, bakery };
};

const validateAndNormalizeRecipe = async (recipe, bakeryId) => {
  if (!Array.isArray(recipe) || recipe.length === 0) {
    return {
      error: "recipe must be a non-empty array for compound ingredients.",
    };
  }

  const normalizedRecipe = [];
  const ingredientIds = [];

  for (const entry of recipe) {
    const ingredientId = entry?.ingredientId;
    const quantity = Number(entry?.quantity);

    if (!ingredientId || !isValidObjectId(ingredientId)) {
      return { error: "Every recipe item must include a valid ingredientId." };
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: "Every recipe item quantity must be greater than 0." };
    }

    normalizedRecipe.push({
      ingredientId,
      quantity,
    });

    ingredientIds.push(ingredientId);
  }

  const existingIngredients = await Ingredient.find({
    _id: { $in: [...new Set(ingredientIds.map((id) => id.toString()))] },
    bakeryId,
  }).select("_id");

  if (
    existingIngredients.length !==
    new Set(ingredientIds.map((id) => id.toString())).size
  ) {
    return {
      error:
        "Some recipe ingredientIds are invalid or do not belong to your bakery.",
    };
  }

  return { value: normalizedRecipe };
};

const validateAndNormalizeProductIngredients = async (
  ingredients,
  bakeryId,
) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return {
      error: "ingredients must be a non-empty array for FIXED products.",
    };
  }

  const normalizedIngredients = [];
  const ingredientIds = [];

  for (const entry of ingredients) {
    const ingredientId = entry?.ingredientId;
    const quantity = Number(entry?.quantity);

    if (!ingredientId || !isValidObjectId(ingredientId)) {
      return {
        error: "Every ingredient row must include a valid ingredientId.",
      };
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: "Every ingredient quantity must be greater than 0." };
    }

    normalizedIngredients.push({ ingredientId, quantity });
    ingredientIds.push(ingredientId);
  }

  const existingIngredients = await Ingredient.find({
    _id: { $in: [...new Set(ingredientIds.map((id) => id.toString()))] },
    bakeryId,
  }).select("_id");

  if (
    existingIngredients.length !==
    new Set(ingredientIds.map((id) => id.toString())).size
  ) {
    return {
      error:
        "Some product ingredientIds are invalid or do not belong to your bakery.",
    };
  }

  return { value: normalizedIngredients };
};

const validateAndNormalizeOptions = async (options, bakeryId) => {
  if (!Array.isArray(options) || options.length === 0) {
    return {
      error: "options must be a non-empty array for CUSTOMIZABLE products.",
    };
  }

  const normalizedOptions = [];
  const ingredientIds = [];

  for (const option of options) {
    const optionName = String(option?.name || "").trim();

    if (!optionName) {
      return { error: "Each option must include a non-empty name." };
    }

    if (!Array.isArray(option.choices) || option.choices.length === 0) {
      return {
        error: `Option ${optionName} must include at least one choice.`,
      };
    }

    const normalizedChoices = [];

    for (const choice of option.choices) {
      const choiceName = String(choice?.name || "").trim();
      const ingredientId = choice?.ingredientId;
      const quantity = Number(choice?.quantity);
      const extraPrice =
        choice?.extraPrice === undefined ? 0 : Number(choice.extraPrice);

      if (!choiceName) {
        return {
          error: `Option ${optionName} has a choice with an empty name.`,
        };
      }

      if (!ingredientId || !isValidObjectId(ingredientId)) {
        return {
          error: `Option ${optionName} has an invalid ingredientId in choices.`,
        };
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return {
          error: `Option ${optionName} has a choice with invalid quantity.`,
        };
      }

      if (!Number.isFinite(extraPrice) || extraPrice < 0) {
        return {
          error: `Option ${optionName} has a choice with invalid extraPrice.`,
        };
      }

      normalizedChoices.push({
        name: choiceName,
        ingredientId,
        quantity,
        extraPrice,
      });

      ingredientIds.push(ingredientId);
    }

    let maxSelections;
    if (option.maxSelections !== undefined && option.maxSelections !== null) {
      const parsedMax = Number(option.maxSelections);
      if (!Number.isInteger(parsedMax) || parsedMax <= 0) {
        return {
          error: `Option ${optionName} maxSelections must be a positive integer when provided.`,
        };
      }
      maxSelections = parsedMax;
    }

    normalizedOptions.push({
      name: optionName,
      required: Boolean(option.required),
      perLayer: Boolean(option.perLayer),
      maxSelections,
      choices: normalizedChoices,
    });
  }

  const existingIngredients = await Ingredient.find({
    _id: { $in: [...new Set(ingredientIds.map((id) => id.toString()))] },
    bakeryId,
  }).select("_id");

  if (
    existingIngredients.length !==
    new Set(ingredientIds.map((id) => id.toString())).size
  ) {
    return {
      error:
        "Some option choice ingredientIds are invalid or do not belong to your bakery.",
    };
  }

  return { value: normalizedOptions };
};

const resolveCategoryForBakery = async ({
  bakeryId,
  categoryId,
  categoryName,
}) => {
  if (categoryId) {
    if (!isValidObjectId(categoryId)) {
      return { error: "categoryId must be a valid id." };
    }

    const category = await Category.findOne({
      _id: categoryId,
      bakeryId,
    });

    if (!category) {
      return {
        error: "Category not found in your bakery.",
      };
    }

    return { value: category };
  }

  if (categoryName !== undefined) {
    const normalizedCategoryName = String(categoryName).trim();

    if (!normalizedCategoryName) {
      return {
        error: "categoryName cannot be empty.",
      };
    }

    const existingCategory = await Category.findOne({
      bakeryId,
      name: {
        $regex: new RegExp(`^${escapeRegex(normalizedCategoryName)}$`, "i"),
      },
    });

    if (existingCategory) {
      return { value: existingCategory };
    }

    const createdCategory = await Category.create({
      bakeryId,
      name: normalizedCategoryName,
    });

    return { value: createdCategory };
  }

  return {
    error: "Either categoryId or categoryName is required.",
  };
};

// API: GET /api/bakery/ingredients
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Optional query: ingredientType=RAW|COMPOUND
// Returns:
// - 200:
//   {
//     message,
//     ingredients: [
//       {
//         id,
//         bakeryId,
//         name,
//         unit, // g | ml | pcs
//         pricePerUnit,
//         ingredientType, // RAW | COMPOUND (derived from recipe length)
//         recipe: [{ ingredientId, quantity }],
//         quantityAvailable,
//         createdAt,
//         updatedAt
//       }
//     ]
//   }
// - 400 when ingredientType is not RAW/COMPOUND
// - 401 when session is missing
// - 403 when logged in user is not bakeryOwner
export const listBakeryIngredients = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;

    const ingredientTypeFilter = req.query.ingredientType
      ? String(req.query.ingredientType).toUpperCase().trim()
      : null;

    if (
      ingredientTypeFilter !== null &&
      !INGREDIENT_TYPES.includes(ingredientTypeFilter)
    ) {
      return res.status(400).json({
        message: "ingredientType must be RAW or COMPOUND.",
      });
    }

    const ingredients = await Ingredient.find({ bakeryId: bakery._id }).sort({
      name: 1,
    });

    const inventoryRows = await BakeryInventory.find({ bakeryId: bakery._id })
      .select("ingredientId quantityAvailable")
      .lean();

    const inventoryMap = new Map(
      inventoryRows.map((row) => [
        toIdString(row.ingredientId),
        row.quantityAvailable,
      ]),
    );

    const serialized = ingredients
      .map((ingredient) =>
        serializeIngredient(
          ingredient,
          inventoryMap.get(toIdString(ingredient._id)) || 0,
        ),
      )
      .filter((ingredient) => {
        if (!ingredientTypeFilter) {
          return true;
        }

        return ingredient.ingredientType === ingredientTypeFilter;
      });

    return res.status(200).json({
      message: "Bakery ingredients fetched successfully.",
      ingredients: serialized,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery ingredients.",
      error: error.message,
    });
  }
};

// API: POST /api/bakery/ingredients
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Body:
//   {
//     name: String,
//     unit: "g" | "ml" | "pcs",
//     pricePerUnit: Number,
//     ingredientType?: "RAW" | "COMPOUND",
//     recipe?: [{ ingredientId: ObjectId, quantity: Number }]
//   }
// - ingredientType is optional:
//   If recipe has items -> COMPOUND, else -> RAW
// - For RAW: recipe must be empty/omitted
// - For COMPOUND: recipe is required and each ingredientId must belong to same bakery
// Returns:
// - 201:
//   {
//     message,
//     ingredient: {
//       id,
//       bakeryId,
//       name,
//       unit,
//       pricePerUnit,
//       ingredientType,
//       recipe,
//       quantityAvailable, // always initialized to 0
//       createdAt,
//       updatedAt
//     }
//   }
// - 409 when ingredient name already exists in same bakery
export const createBakeryIngredient = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;

    const { name, unit, pricePerUnit, ingredientType, recipe } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedUnit = String(unit || "").trim();
    const normalizedPricePerUnit = Number(pricePerUnit);

    if (!normalizedName) {
      return res.status(400).json({
        message: "name is required.",
      });
    }

    if (!ALLOWED_UNITS.includes(normalizedUnit)) {
      return res.status(400).json({
        message: "unit must be one of: g, ml, pcs.",
      });
    }

    if (
      !Number.isFinite(normalizedPricePerUnit) ||
      normalizedPricePerUnit < 0
    ) {
      return res.status(400).json({
        message: "pricePerUnit must be a non-negative number.",
      });
    }

    const selectedIngredientType = ingredientType
      ? String(ingredientType).toUpperCase().trim()
      : recipe && Array.isArray(recipe) && recipe.length > 0
        ? "COMPOUND"
        : "RAW";

    if (!INGREDIENT_TYPES.includes(selectedIngredientType)) {
      return res.status(400).json({
        message: "ingredientType must be RAW or COMPOUND when provided.",
      });
    }

    const duplicate = await Ingredient.findOne({
      bakeryId: bakery._id,
      name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "An ingredient with this name already exists in your bakery.",
      });
    }

    let normalizedRecipe = [];

    if (selectedIngredientType === "COMPOUND") {
      const recipeResult = await validateAndNormalizeRecipe(recipe, bakery._id);
      if (recipeResult.error) {
        return res.status(400).json({
          message: recipeResult.error,
        });
      }
      normalizedRecipe = recipeResult.value;
    }

    if (
      selectedIngredientType === "RAW" &&
      Array.isArray(recipe) &&
      recipe.length > 0
    ) {
      return res.status(400).json({
        message: "RAW ingredients cannot include recipe entries.",
      });
    }

    const ingredient = await Ingredient.create({
      bakeryId: bakery._id,
      name: normalizedName,
      unit: normalizedUnit,
      pricePerUnit: normalizedPricePerUnit,
      recipe: normalizedRecipe,
    });

    const inventory = await BakeryInventory.findOneAndUpdate(
      { bakeryId: bakery._id, ingredientId: ingredient._id },
      {
        $setOnInsert: {
          bakeryId: bakery._id,
          ingredientId: ingredient._id,
          quantityAvailable: 0,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return res.status(201).json({
      message: "Ingredient created successfully.",
      ingredient: serializeIngredient(ingredient, inventory.quantityAvailable),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating ingredient.",
      error: error.message,
    });
  }
};

// API: POST /api/bakery/ingredients/stock
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Body:
//   {
//     ingredientId: ObjectId,
//     quantityToAdd: Number // must be > 0
//   }
// Returns:
// - 200:
//   {
//     message,
//     ingredient: {
//       id,
//       bakeryId,
//       name,
//       unit,
//       pricePerUnit,
//       ingredientType,
//       recipe,
//       quantityAvailable, // updated total after adding stock
//       createdAt,
//       updatedAt
//     }
//   }
export const addIngredientStock = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;

    const { ingredientId, quantityToAdd } = req.body;

    if (!ingredientId || !isValidObjectId(ingredientId)) {
      return res.status(400).json({
        message: "ingredientId must be a valid id.",
      });
    }

    const normalizedQuantityToAdd = Number(quantityToAdd);

    if (
      !Number.isFinite(normalizedQuantityToAdd) ||
      normalizedQuantityToAdd <= 0
    ) {
      return res.status(400).json({
        message: "quantityToAdd must be greater than 0.",
      });
    }

    const ingredient = await Ingredient.findOne({
      _id: ingredientId,
      bakeryId: bakery._id,
    });

    if (!ingredient) {
      return res.status(404).json({
        message: "Ingredient not found in your bakery.",
      });
    }

    const inventory = await BakeryInventory.findOneAndUpdate(
      { bakeryId: bakery._id, ingredientId: ingredient._id },
      {
        $inc: {
          quantityAvailable: normalizedQuantityToAdd,
        },
        $setOnInsert: {
          bakeryId: bakery._id,
          ingredientId: ingredient._id,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return res.status(200).json({
      message: "Ingredient stock added successfully.",
      ingredient: serializeIngredient(ingredient, inventory.quantityAvailable),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error adding ingredient stock.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/products
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Optional query: includeInactive=true|false
// Returns:
// - 200:
//   {
//     message,
//     products: [
//       {
//         id,
//         bakeryId,
//         categoryId,
//         name,
//         type, // FIXED | CUSTOMIZABLE
//         basePrice,
//         ingredients: [{ ingredientId, quantity }], // used by FIXED
//         allergens,
//         nutrition,
//         isActive,
//         options: [
//           {
//             id,
//             productId,
//             name,
//             required,
//             perLayer,
//             maxSelections,
//             choices: [{ name, ingredientId, quantity, extraPrice }],
//             createdAt,
//             updatedAt
//           }
//         ],
//         createdAt,
//         updatedAt
//       }
//     ]
//   }
export const listBakeryProducts = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;
    const includeInactive =
      String(req.query.includeInactive || "false").toLowerCase() === "true";

    const filter = { bakeryId: bakery._id };
    if (!includeInactive) {
      filter.isActive = true;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
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

    const serializedProducts = products.map((product) =>
      serializeProduct(
        product,
        serializeOptions(optionsByProductId.get(toIdString(product._id)) || []),
      ),
    );

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
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Body:
//   {
//     name: String,
//     type: "FIXED" | "CUSTOMIZABLE",
//     basePrice: Number,
//     categoryId?: ObjectId,
//     categoryName?: String,
//     ingredients?: [{ ingredientId: ObjectId, quantity: Number }],
//     options?: [
//       {
//         name: String,
//         required?: Boolean,
//         perLayer?: Boolean,
//         maxSelections?: Number,
//         choices: [{ name: String, ingredientId: ObjectId, quantity: Number, extraPrice?: Number }]
//       }
//     ],
//     allergens?: String[],
//     nutrition?: { calories?, protein?, carbohydrates?, fats?, sugar?, fiber? },
//     isActive?: Boolean
//   }
// - Rules:
//   FIXED requires ingredients and cannot include options
//   CUSTOMIZABLE requires options and cannot include ingredients
//   categoryId or categoryName is required (categoryName auto-creates if missing)
// Returns:
// - 201:
//   {
//     message,
//     product: {
//       id,
//       bakeryId,
//       categoryId,
//       name,
//       type,
//       basePrice,
//       ingredients,
//       allergens,
//       nutrition,
//       isActive,
//       options,
//       createdAt,
//       updatedAt
//     }
//   }
export const createBakeryProduct = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;

    const {
      name,
      type,
      basePrice,
      categoryId,
      categoryName,
      ingredients,
      options,
      allergens,
      nutrition,
      isActive,
    } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedType = String(type || "")
      .toUpperCase()
      .trim();
    const normalizedBasePrice = Number(basePrice);

    if (!normalizedName) {
      return res.status(400).json({
        message: "name is required.",
      });
    }

    if (!PRODUCT_TYPES.includes(normalizedType)) {
      return res.status(400).json({
        message: "type must be FIXED or CUSTOMIZABLE.",
      });
    }

    if (!Number.isFinite(normalizedBasePrice) || normalizedBasePrice < 0) {
      return res.status(400).json({
        message: "basePrice must be a non-negative number.",
      });
    }

    const categoryResult = await resolveCategoryForBakery({
      bakeryId: bakery._id,
      categoryId,
      categoryName,
    });

    if (categoryResult.error) {
      return res.status(400).json({
        message: categoryResult.error,
      });
    }

    const normalizedAllergens = normalizeStringArray(allergens);
    if (normalizedAllergens === null) {
      return res.status(400).json({
        message: "allergens must be an array of strings when provided.",
      });
    }

    const nutritionResult = normalizeNutrition(nutrition);
    if (nutritionResult.error) {
      return res.status(400).json({
        message: nutritionResult.error,
      });
    }

    let normalizedIngredients = [];
    let normalizedOptions = [];

    if (normalizedType === "FIXED") {
      const ingredientResult = await validateAndNormalizeProductIngredients(
        ingredients,
        bakery._id,
      );
      if (ingredientResult.error) {
        return res.status(400).json({
          message: ingredientResult.error,
        });
      }
      normalizedIngredients = ingredientResult.value;

      if (Array.isArray(options) && options.length > 0) {
        return res.status(400).json({
          message: "FIXED products cannot include options.",
        });
      }
    }

    if (normalizedType === "CUSTOMIZABLE") {
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        return res.status(400).json({
          message:
            "CUSTOMIZABLE products cannot include fixed ingredients list.",
        });
      }

      const optionResult = await validateAndNormalizeOptions(
        options,
        bakery._id,
      );
      if (optionResult.error) {
        return res.status(400).json({
          message: optionResult.error,
        });
      }
      normalizedOptions = optionResult.value;
    }

    const product = await Product.create({
      bakeryId: bakery._id,
      categoryId: categoryResult.value._id,
      name: normalizedName,
      type: normalizedType,
      basePrice: normalizedBasePrice,
      ingredients: normalizedIngredients,
      allergens: normalizedAllergens || [],
      nutrition:
        nutritionResult.value === null ? undefined : nutritionResult.value,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    let createdOptions = [];

    if (normalizedType === "CUSTOMIZABLE") {
      createdOptions = await ProductOption.insertMany(
        normalizedOptions.map((option) => ({
          productId: product._id,
          name: option.name,
          required: option.required,
          perLayer: option.perLayer,
          maxSelections: option.maxSelections,
          choices: option.choices,
        })),
      );
    }

    return res.status(201).json({
      message: "Product created successfully.",
      product: serializeProduct(product, serializeOptions(createdOptions)),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating product.",
      error: error.message,
    });
  }
};

// API: PATCH /api/bakery/products/:productId
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Path param: productId
// - Body supports partial updates:
//   {
//     name?: String,
//     type?: "FIXED" | "CUSTOMIZABLE",
//     basePrice?: Number,
//     categoryId?: ObjectId,
//     categoryName?: String,
//     ingredients?: [{ ingredientId, quantity }],
//     options?: [{ name, required, perLayer, maxSelections, choices }],
//     allergens?: String[],
//     nutrition?: { calories?, protein?, carbohydrates?, fats?, sugar?, fiber? },
//     isActive?: Boolean
//   }
// - Type conversion rules:
//   CUSTOMIZABLE -> FIXED requires ingredients in same request
//   FIXED -> CUSTOMIZABLE requires options in same request
// Returns:
// - 200 with updated product + options (same product schema as create API)
export const updateBakeryProduct = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;
    const { productId } = req.params;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        message: "productId must be a valid id.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      bakeryId: bakery._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found in your bakery.",
      });
    }

    const {
      name,
      type,
      basePrice,
      categoryId,
      categoryName,
      ingredients,
      options,
      allergens,
      nutrition,
      isActive,
    } = req.body;

    const hasTypeUpdate = type !== undefined;
    const nextType = hasTypeUpdate
      ? String(type).toUpperCase().trim()
      : product.type;

    if (!PRODUCT_TYPES.includes(nextType)) {
      return res.status(400).json({
        message: "type must be FIXED or CUSTOMIZABLE when provided.",
      });
    }

    const updatePayload = {};

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (!normalizedName) {
        return res.status(400).json({
          message: "name cannot be empty.",
        });
      }
      updatePayload.name = normalizedName;
    }

    if (basePrice !== undefined) {
      const normalizedBasePrice = Number(basePrice);
      if (!Number.isFinite(normalizedBasePrice) || normalizedBasePrice < 0) {
        return res.status(400).json({
          message: "basePrice must be a non-negative number.",
        });
      }
      updatePayload.basePrice = normalizedBasePrice;
    }

    if (categoryId !== undefined || categoryName !== undefined) {
      const categoryResult = await resolveCategoryForBakery({
        bakeryId: bakery._id,
        categoryId,
        categoryName,
      });

      if (categoryResult.error) {
        return res.status(400).json({
          message: categoryResult.error,
        });
      }

      updatePayload.categoryId = categoryResult.value._id;
    }

    if (allergens !== undefined) {
      const normalizedAllergens = normalizeStringArray(allergens);
      if (normalizedAllergens === null) {
        return res.status(400).json({
          message: "allergens must be an array of strings when provided.",
        });
      }
      updatePayload.allergens = normalizedAllergens;
    }

    if (nutrition !== undefined) {
      const nutritionResult = normalizeNutrition(nutrition);
      if (nutritionResult.error) {
        return res.status(400).json({
          message: nutritionResult.error,
        });
      }
      updatePayload.nutrition =
        nutritionResult.value === null ? undefined : nutritionResult.value;
    }

    if (isActive !== undefined) {
      updatePayload.isActive = Boolean(isActive);
    }

    if (hasTypeUpdate) {
      updatePayload.type = nextType;
    }

    let normalizedIngredients;
    let normalizedOptions;

    if (nextType === "FIXED") {
      if (options !== undefined) {
        return res.status(400).json({
          message: "FIXED products cannot include options.",
        });
      }

      if (
        hasTypeUpdate &&
        product.type === "CUSTOMIZABLE" &&
        ingredients === undefined
      ) {
        return res.status(400).json({
          message:
            "When changing CUSTOMIZABLE to FIXED, ingredients are required.",
        });
      }

      if (ingredients !== undefined) {
        const ingredientResult = await validateAndNormalizeProductIngredients(
          ingredients,
          bakery._id,
        );
        if (ingredientResult.error) {
          return res.status(400).json({
            message: ingredientResult.error,
          });
        }
        normalizedIngredients = ingredientResult.value;
        updatePayload.ingredients = normalizedIngredients;
      }
    }

    if (nextType === "CUSTOMIZABLE") {
      if (ingredients !== undefined) {
        return res.status(400).json({
          message:
            "CUSTOMIZABLE products cannot include fixed ingredients list.",
        });
      }

      if (hasTypeUpdate && product.type === "FIXED" && options === undefined) {
        return res.status(400).json({
          message: "When changing FIXED to CUSTOMIZABLE, options are required.",
        });
      }

      if (options !== undefined) {
        const optionResult = await validateAndNormalizeOptions(
          options,
          bakery._id,
        );
        if (optionResult.error) {
          return res.status(400).json({
            message: optionResult.error,
          });
        }
        normalizedOptions = optionResult.value;
      }

      if (hasTypeUpdate) {
        updatePayload.ingredients = [];
      }
    }

    Object.assign(product, updatePayload);
    await product.save();

    if (product.type === "FIXED") {
      await ProductOption.deleteMany({ productId: product._id });
    }

    if (product.type === "CUSTOMIZABLE" && normalizedOptions) {
      await ProductOption.deleteMany({ productId: product._id });
      await ProductOption.insertMany(
        normalizedOptions.map((option) => ({
          productId: product._id,
          name: option.name,
          required: option.required,
          perLayer: option.perLayer,
          maxSelections: option.maxSelections,
          choices: option.choices,
        })),
      );
    }

    const updatedOptions = await ProductOption.find({
      productId: product._id,
    }).lean();

    return res.status(200).json({
      message: "Product updated successfully.",
      product: serializeProduct(product, serializeOptions(updatedOptions)),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating product.",
      error: error.message,
    });
  }
};

// API: DELETE /api/bakery/products/:productId
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Path param: productId
// Returns:
// - 200:
//   {
//     message,
//     productId,
//     isActive: false
//   }
// - Note: this is a soft delete, product row remains in DB
export const deleteBakeryProduct = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;
    const { productId } = req.params;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        message: "productId must be a valid id.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      bakeryId: bakery._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found in your bakery.",
      });
    }

    product.isActive = false;
    await product.save();

    return res.status(200).json({
      message: "Product deleted successfully (soft delete).",
      productId: toIdString(product._id),
      isActive: product.isActive,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting product.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/menu/:bakeryId/products
// Expects:
// - Path param: bakeryId
// - Public endpoint (no session required)
// - Optional query params:
//   page (default 1), limit (default 20, max 100), categoryId
// Returns:
// - 200 with active menu products for the bakery:
//   {
//     message,
//     bakery: { id, name, isActive },
//     page,
//     limit,
//     totalProducts,
//     totalPages,
//     products: [
//       {
//         id,
//         bakeryId,
//         categoryId,
//         category: { id, name } | null,
//         name,
//         type,
//         basePrice,
//         ingredients,
//         allergens,
//         nutrition,
//         isActive,
//         options: [
//           {
//             id,
//             productId,
//             name,
//             required,
//             perLayer,
//             maxSelections,
//             choices: [{ name, ingredientId, quantity, extraPrice }],
//             createdAt,
//             updatedAt
//           }
//         ],
//         createdAt,
//         updatedAt
//       }
//     ]
//   }
// - CUSTOMIZABLE products include full options for frontend selection UI
// - FIXED products return options: []
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

    const categories = await Category.find({
      _id: { $in: categoryIds },
      bakeryId: bakery._id,
    })
      .select("_id name")
      .lean();

    const categoryById = new Map(
      categories.map((category) => [toIdString(category._id), category]),
    );

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
        isActive: bakery.isActive,
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
// Expects:
// - Path param: productId
// - Public endpoint (no session required)
// Returns:
// - 200 with product details for menu rendering:
//   {
//     message,
//     product: {
//       id,
//       bakeryId,
//       categoryId,
//       name,
//       type,
//       basePrice,
//       ingredients,
//       allergens,
//       nutrition,
//       isActive,
//       options: [
//         {
//           id,
//           productId,
//           name,
//           required,
//           perLayer,
//           maxSelections,
//           choices: [{ name, ingredientId, quantity, extraPrice }],
//           createdAt,
//           updatedAt
//         }
//       ],
//       bakery: { id, name, isActive },
//       category: { id, name } | null,
//       createdAt,
//       updatedAt
//     }
//   }
// - For FIXED products, options is []
// - For CUSTOMIZABLE products, options contains all selectable menu options
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

    const bakery = await Bakery.findOne({
      _id: product.bakeryId,
      isActive: true,
    })
      .select("_id name isActive")
      .lean();

    if (!bakery) {
      return res.status(404).json({
        message: "Bakery for this product was not found or inactive.",
      });
    }

    const category = await Category.findOne({
      _id: product.categoryId,
      bakeryId: bakery._id,
    })
      .select("_id name")
      .lean();

    const optionDocs =
      product.type === "CUSTOMIZABLE"
        ? await ProductOption.find({ productId: product._id }).lean()
        : [];

    const serializedProduct = serializeProduct(
      product,
      serializeOptions(optionDocs),
    );

    serializedProduct.bakery = {
      id: toIdString(bakery._id),
      name: bakery.name,
      isActive: bakery.isActive,
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
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Optional query params:
//   page (default 1), limit (default 20, max 100), status (pending|completed)
// Returns:
// - 200 with owner bakery orders:
//   {
//     message,
//     page,
//     limit,
//     totalOrders,
//     totalPages,
//     orders: [
//       {
//         id,
//         userId,
//         customer: { id, name, email, contactNumber } | null,
//         bakeryId,
//         totalPrice,
//         status,
//         items: [
//           {
//             productId,
//             product: { id, name, type, basePrice } | null,
//             quantity,
//             finalPrice,
//             selectedOptions: [{ optionName, choiceName, ingredientId, quantity, layer }]
//           }
//         ],
//         createdAt,
//         updatedAt
//       }
//     ]
//   }
export const listBakeryPastOrders = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const normalizedStatus = req.query.status
      ? String(req.query.status).toLowerCase().trim()
      : null;

    if (normalizedStatus && !ORDER_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "status must be one of: pending, completed.",
      });
    }

    const filter = { bakeryId: bakery._id };
    if (normalizedStatus) {
      filter.status = normalizedStatus;
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "_id name email contactNumber")
        .populate("items.productId", "_id name type basePrice")
        .lean(),
      Order.countDocuments(filter),
    ]);

    const serializedOrders = orders.map((order) => ({
      id: toIdString(order._id),
      userId: order.userId?._id
        ? toIdString(order.userId._id)
        : toIdString(order.userId),
      customer: order.userId?._id
        ? {
            id: toIdString(order.userId._id),
            name: order.userId.name,
            email: order.userId.email,
            contactNumber: order.userId.contactNumber,
          }
        : null,
      bakeryId: toIdString(order.bakeryId),
      totalPrice: order.totalPrice,
      status: order.status,
      items: (order.items || []).map((item) => ({
        productId: item.productId?._id
          ? toIdString(item.productId._id)
          : toIdString(item.productId),
        product: item.productId?._id
          ? {
              id: toIdString(item.productId._id),
              name: item.productId.name,
              type: item.productId.type,
              basePrice: item.productId.basePrice,
            }
          : null,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        selectedOptions: (item.selectedOptions || []).map((selectedOption) => ({
          optionName: selectedOption.optionName,
          choiceName: selectedOption.choiceName,
          ingredientId: toIdString(selectedOption.ingredientId),
          quantity: selectedOption.quantity,
          layer: selectedOption.layer,
        })),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return res.status(200).json({
      message: "Bakery past orders fetched successfully.",
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders: serializedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery past orders.",
      error: error.message,
    });
  }
};

// API: PATCH /api/bakery/orders/:orderId/status
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// - Path param: orderId
// - Body:
//   {
//     status: "pending" | "completed"
//   }
// Returns:
// - 200:
//   {
//     message,
//     order: {
//       id,
//       bakeryId,
//       userId,
//       previousStatus,
//       status,
//       totalPrice,
//       updatedAt
//     }
//   }
export const updateBakeryOrderStatus = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;
    const { orderId } = req.params;
    const requestedStatus = req.body?.status;

    if (!orderId || !isValidObjectId(orderId)) {
      return res.status(400).json({
        message: "orderId must be a valid id.",
      });
    }

    const normalizedStatus = String(requestedStatus || "")
      .toLowerCase()
      .trim();

    if (!ORDER_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "status must be one of: pending, completed.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      bakeryId: bakery._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found in your bakery.",
      });
    }

    const previousStatus = order.status;

    order.status = normalizedStatus;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully.",
      order: {
        id: toIdString(order._id),
        bakeryId: toIdString(order.bakeryId),
        userId: toIdString(order.userId),
        previousStatus,
        status: order.status,
        totalPrice: order.totalPrice,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating order status.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/analytics
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be bakeryOwner
// Returns:
// - 200:
//   {
//     message,
//     analytics: {
//       bakeryId,
//       totalOrders,
//       pendingOrders,
//       completedOrders,
//       totalProfit
//     }
//   }
// - totalProfit is calculated as sum(totalPrice) of completed orders.
export const getBakeryAnalytics = async (req, res) => {
  try {
    const ownerContext = await getOwnerBakeryContext(req.authUser.id);
    if (ownerContext.error) {
      return res
        .status(ownerContext.error.status)
        .json({ message: ownerContext.error.message });
    }

    const { bakery } = ownerContext;

    const [analyticsAgg] = await Order.aggregate([
      {
        $match: {
          bakeryId: bakery._id,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          totalProfit: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$totalPrice", 0],
            },
          },
        },
      },
    ]);

    const analytics = {
      bakeryId: toIdString(bakery._id),
      totalOrders: analyticsAgg?.totalOrders || 0,
      pendingOrders: analyticsAgg?.pendingOrders || 0,
      completedOrders: analyticsAgg?.completedOrders || 0,
      totalProfit: Number(Number(analyticsAgg?.totalProfit || 0).toFixed(2)),
    };

    return res.status(200).json({
      message: "Bakery analytics fetched successfully.",
      analytics,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery analytics.",
      error: error.message,
    });
  }
};

// API: POST /api/bakery/reviews
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be customer
// - Body:
//   {
//     bakeryId: ObjectId,
//     rating: Number, // 1..5
//     comment?: String // max 1000 chars
//   }
// Returns:
// - 201:
//   {
//     message,
//     review: {
//       id,
//       userId,
//       user: { id, name, email, contactNumber } | null,
//       bakeryId,
//       rating,
//       comment,
//       isHidden,
//       createdAt,
//       updatedAt
//     }
//   }
// - 409 if the same user already reviewed the same bakery
//   (one review per user per bakery)
export const createBakeryReview = async (req, res) => {
  try {
    const { bakeryId, rating, comment } = req.body;

    if (!bakeryId || !isValidObjectId(bakeryId)) {
      return res.status(400).json({
        message: "bakeryId is required and must be a valid id.",
      });
    }

    const normalizedRating = Number(rating);
    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      return res.status(400).json({
        message: "rating must be a number between 1 and 5.",
      });
    }

    const normalizedComment =
      comment === undefined || comment === null ? "" : String(comment).trim();

    if (normalizedComment.length > 1000) {
      return res.status(400).json({
        message: "comment cannot exceed 1000 characters.",
      });
    }

    const bakery = await Bakery.findById(bakeryId)
      .select("_id isActive")
      .lean();
    if (!bakery) {
      return res.status(404).json({
        message: "Bakery not found.",
      });
    }

    if (!bakery.isActive) {
      return res.status(400).json({
        message: "Cannot review an inactive bakery.",
      });
    }

    const existingReview = await Review.findOne({
      userId: req.authUser.id,
      bakeryId,
    })
      .select("_id")
      .lean();

    if (existingReview) {
      return res.status(409).json({
        message:
          "You have already reviewed this bakery. One review per user per bakery is allowed.",
      });
    }

    const review = await Review.create({
      userId: req.authUser.id,
      bakeryId,
      rating: normalizedRating,
      comment: normalizedComment || undefined,
    });

    const createdReview = await Review.findById(review._id)
      .populate("userId", "_id name email contactNumber")
      .lean();

    return res.status(201).json({
      message: "Review submitted successfully.",
      review: serializeReview(createdReview),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting review.",
      error: error.message,
    });
  }
};

// API: GET /api/bakery/reviews
// Expects:
// - Public endpoint (no login required)
// - Optional query params:
//   bakeryId (required), page (default 1), limit (default 20, max 100), includeHidden=true|false
// - includeHidden=true is only honored when the logged-in session is bakeryOwner
//   and that owner manages the same bakeryId. For all public users, hidden reviews
//   are excluded automatically.
// Returns:
// - 200 with bakery reviews:
//   {
//     message,
//     page,
//     limit,
//     totalReviews,
//     totalPages,
//     averageRating,
//     reviews: [
//       {
//         id,
//         userId,
//         user: { id, name, email, contactNumber } | null,
//         bakeryId,
//         rating,
//         comment,
//         isHidden,
//         createdAt,
//         updatedAt
//       }
//     ]
//   }
export const listBakeryReviews = async (req, res) => {
  try {
    const { bakeryId } = req.query;

    if (!bakeryId || !isValidObjectId(bakeryId)) {
      return res.status(400).json({
        message: "bakeryId query param is required and must be a valid id.",
      });
    }

    const bakery = await Bakery.findById(bakeryId).select("_id ownerId").lean();

    if (!bakery) {
      return res.status(404).json({
        message: "Bakery not found.",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const includeHiddenRequested =
      String(req.query.includeHidden || "false").toLowerCase() === "true";

    const ownerCanViewHidden =
      includeHiddenRequested &&
      req.session?.role === OWNER_ROLE &&
      req.session?.userId &&
      toIdString(bakery.ownerId) === String(req.session.userId);

    const includeHidden = ownerCanViewHidden;

    const filter = { bakeryId: bakery._id };
    if (!includeHidden) {
      filter.isHidden = false;
    }

    const [reviews, totalReviews, averageAgg] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "_id name email contactNumber")
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const averageRating = averageAgg[0]?.averageRating
      ? Number(Number(averageAgg[0].averageRating).toFixed(2))
      : 0;

    return res.status(200).json({
      message: "Bakery reviews fetched successfully.",
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      averageRating,
      reviews: reviews.map(serializeReview),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching bakery reviews.",
      error: error.message,
    });
  }
};
