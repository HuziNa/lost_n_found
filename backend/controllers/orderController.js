import mongoose from "mongoose";
import Bakery from "../models/Bakery.js";
import BakeryInventory from "../models/BakeryInventory.js";
import Ingredient from "../models/Ingredients.js";
import Order from "../models/Order.js";
import ProductOption from "../models/ProductOption.js";
import Product from "../models/Products.js";
import User from "../models/User.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

const PRODUCT_TYPE_FIXED = "FIXED";
const PRODUCT_TYPE_CUSTOMIZABLE = "CUSTOMIZABLE";

const toIdString = (value) => (value ? value.toString() : null);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const roundQuantity = (value) => Number(Number(value).toFixed(6));

const normalizeOrderItemSelection = (selectedOptions) => {
  if (!Array.isArray(selectedOptions)) {
    return {
      error: "selectedOptions must be an array for CUSTOMIZABLE products.",
    };
  }

  if (selectedOptions.length === 0) {
    return {
      error:
        "selectedOptions is required for CUSTOMIZABLE products and cannot be empty.",
    };
  }

  const normalized = [];

  for (const selectedOption of selectedOptions) {
    const optionName = String(selectedOption?.optionName || "").trim();
    const choiceName = String(selectedOption?.choiceName || "").trim();

    if (!optionName || !choiceName) {
      return {
        error: "Each selected option must include optionName and choiceName.",
      };
    }

    const layerRaw = selectedOption?.layer;
    let layer;

    if (
      layerRaw !== undefined &&
      layerRaw !== null &&
      String(layerRaw).trim() !== ""
    ) {
      const parsedLayer = Number(layerRaw);
      if (!Number.isInteger(parsedLayer) || parsedLayer <= 0) {
        return {
          error:
            "layer must be a positive integer when provided in selectedOptions.",
        };
      }
      layer = parsedLayer;
    }

    normalized.push({ optionName, choiceName, layer });
  }

  return { value: normalized };
};

const validateOrderPayload = (payload) => {
  const bakeryId = payload?.bakeryId;
  const items = payload?.items;

  if (!bakeryId || !isValidObjectId(bakeryId)) {
    return { error: "bakeryId is required and must be a valid id." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "items must be a non-empty array." };
  }

  const normalizedItems = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const productId = item?.productId;
    const quantity = Number(item?.quantity);

    if (!productId || !isValidObjectId(productId)) {
      return {
        error: `items[${index}].productId must be a valid id.`,
      };
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return {
        error: `items[${index}].quantity must be greater than 0.`,
      };
    }

    const roundedQuantity = roundQuantity(quantity);

    if (roundedQuantity <= 0) {
      return {
        error: `items[${index}].quantity must be greater than 0.`,
      };
    }

    normalizedItems.push({
      productId,
      quantity: roundedQuantity,
      selectedOptions: item?.selectedOptions,
    });
  }

  return {
    value: {
      bakeryId,
      items: normalizedItems,
    },
  };
};

const buildOptionMaps = (optionDocs) => {
  const optionMap = new Map();

  for (const optionDoc of optionDocs) {
    const normalizedOptionKey = optionDoc.name.toLowerCase();
    if (!optionMap.has(normalizedOptionKey)) {
      optionMap.set(normalizedOptionKey, optionDoc);
    }
  }

  return optionMap;
};

const findChoiceByName = (optionDoc, choiceName) => {
  const normalizedChoiceName = choiceName.toLowerCase();
  return (optionDoc.choices || []).find(
    (choice) =>
      String(choice.name || "").toLowerCase() === normalizedChoiceName,
  );
};

const serializeOrder = (orderDoc) => ({
  id: toIdString(orderDoc._id),
  userId: toIdString(orderDoc.userId),
  bakeryId: toIdString(orderDoc.bakeryId),
  totalPrice: orderDoc.totalPrice,
  status: orderDoc.status,
  items: (orderDoc.items || []).map((item) => ({
    productId: toIdString(item.productId),
    quantity: item.quantity,
    finalPrice: item.finalPrice,
    selectedOptions: (item.selectedOptions || []).map((option) => ({
      optionName: option.optionName,
      choiceName: option.choiceName,
      ingredientId: toIdString(option.ingredientId),
      quantity: option.quantity,
      layer: option.layer,
    })),
  })),
  createdAt: orderDoc.createdAt,
  updatedAt: orderDoc.updatedAt,
});

const addIngredientUsage = (usageMap, ingredientId, quantity) => {
  const normalizedIngredientId = toIdString(ingredientId);
  const previous = usageMap.get(normalizedIngredientId) || 0;
  usageMap.set(normalizedIngredientId, roundQuantity(previous + quantity));
};

const rollbackDeductions = async (bakeryId, deductions) => {
  if (!deductions.length) {
    return;
  }

  await Promise.all(
    deductions.map((deduction) =>
      BakeryInventory.updateOne(
        { bakeryId, ingredientId: deduction.ingredientId },
        { $inc: { quantityAvailable: deduction.quantity } },
      ),
    ),
  );
};

const expandIngredientToRaw = ({
  ingredientId,
  quantity,
  ingredientMap,
  rawUsageMap,
  path = [],
}) => {
  const normalizedIngredientId = toIdString(ingredientId);
  const ingredient = ingredientMap.get(normalizedIngredientId);

  if (!ingredient) {
    throw new Error(
      `Ingredient ${normalizedIngredientId} was not found while expanding recipes.`,
    );
  }

  if (path.includes(normalizedIngredientId)) {
    throw new Error(
      `Circular ingredient recipe detected at ingredient ${normalizedIngredientId}.`,
    );
  }

  const recipe = ingredient.recipe || [];

  if (recipe.length === 0) {
    addIngredientUsage(rawUsageMap, normalizedIngredientId, quantity);
    return;
  }

  const nextPath = [...path, normalizedIngredientId];

  for (const recipeEntry of recipe) {
    const recipeQuantity = Number(recipeEntry.quantity);
    const requiredSubQuantity = roundQuantity(quantity * recipeQuantity);

    expandIngredientToRaw({
      ingredientId: recipeEntry.ingredientId,
      quantity: requiredSubQuantity,
      ingredientMap,
      rawUsageMap,
      path: nextPath,
    });
  }
};

// API: POST /api/orders
// Expects:
// - Session cookie from /api/auth/login
// - Logged in user must be customer
// - Body:
//   {
//     bakeryId: ObjectId,
//     items: [
//       {
//         productId: ObjectId,
//         quantity: Number,
//         selectedOptions?: [
//           {
//             optionName: String,
//             choiceName: String,
//             layer?: Number
//           }
//         ]
//       }
//     ]
//   }
// - For FIXED products: selectedOptions must be omitted or empty
// - For CUSTOMIZABLE products: selectedOptions is required
//   optionName/choiceName are resolved against ProductOption choices,
//   then stored in order snapshot with ingredientId + quantity
// Returns:
// - 201:
//   {
//     message,
//     order: {
//       id,
//       userId,
//       bakeryId,
//       totalPrice,
//       status,
//       items: [
//         {
//           productId,
//           quantity,
//           finalPrice,
//           selectedOptions: [
//             { optionName, choiceName, ingredientId, quantity, layer }
//           ]
//         }
//       ],
//       createdAt,
//       updatedAt
//     },
//     inventoryImpact: {
//       rawIngredientsUsed: [{ ingredientId, name, unit, quantityUsed }]
//     }
//   }
// Flow implemented exactly as schema:
// 1) Validate products
// 2) Build ingredient list (FIXED ingredients / CUSTOM selectedOptions)
// 3) Expand COMPOUND ingredients recursively to RAW ingredients
// 4) Check inventory quantities before deduction
// 5) Deduct stock
// 6) Save order with selectedOptions snapshot
// optionName and choiceName must match exactly what was configured.
export const placeOrder = async (req, res) => {
  const deductions = [];

  try {
    const payloadResult = validateOrderPayload(req.body);
    if (payloadResult.error) {
      return res.status(400).json({ message: payloadResult.error });
    }

    const { bakeryId, items } = payloadResult.value;

    const customer = await User.findById(req.authUser.id).select(
      "_id role name email",
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    if (customer.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can place orders." });
    }

    const bakery = await Bakery.findById(bakeryId).select("_id isActive name");
    if (!bakery) {
      return res.status(404).json({ message: "Bakery not found." });
    }

    if (!bakery.isActive) {
      return res.status(400).json({
        message: "This bakery is currently inactive and cannot accept orders.",
      });
    }

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];

    const products = await Product.find({
      _id: { $in: uniqueProductIds },
      bakeryId,
      isActive: true,
    }).lean();

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({
        message:
          "Some products are invalid, inactive, or do not belong to the selected bakery.",
      });
    }

    const productById = new Map(
      products.map((product) => [toIdString(product._id), product]),
    );

    const customizableCategoryIds = products
      .filter((product) => product.type === PRODUCT_TYPE_CUSTOMIZABLE)
      .map((product) => product.categoryId);

    const productOptions = await ProductOption.find({
      categoryId: { $in: customizableCategoryIds },
    }).lean();

    const optionsByCategoryId = new Map();
    for (const option of productOptions) {
      const key = toIdString(option.categoryId);
      if (!optionsByCategoryId.has(key)) {
        optionsByCategoryId.set(key, []);
      }
      optionsByCategoryId.get(key).push(option);
    }

    const ingredientUsageMap = new Map();
    const orderItems = [];
    let totalPrice = 0;

    for (const [index, requestedItem] of items.entries()) {
      const product = productById.get(toIdString(requestedItem.productId));

      if (!product) {
        return res.status(400).json({
          message: `items[${index}] references an unknown product.`,
        });
      }

      const quantity = requestedItem.quantity;
      const orderItem = {
        productId: product._id,
        quantity,
        selectedOptions: [],
        finalPrice: 0,
      };

      let finalUnitPrice = Number(product.basePrice);

      if (product.type === PRODUCT_TYPE_FIXED) {
        if (
          Array.isArray(requestedItem.selectedOptions) &&
          requestedItem.selectedOptions.length > 0
        ) {
          return res.status(400).json({
            message: `items[${index}] is FIXED and cannot include selectedOptions.`,
          });
        }

        for (const ingredientEntry of product.ingredients || []) {
          const requiredQuantity = roundQuantity(
            Number(ingredientEntry.quantity) * quantity,
          );
          addIngredientUsage(
            ingredientUsageMap,
            ingredientEntry.ingredientId,
            requiredQuantity,
          );
        }
      }

      if (product.type === PRODUCT_TYPE_CUSTOMIZABLE) {
        const normalizedSelectionResult = normalizeOrderItemSelection(
          requestedItem.selectedOptions,
        );

        if (normalizedSelectionResult.error) {
          return res.status(400).json({
            message: `items[${index}]: ${normalizedSelectionResult.error}`,
          });
        }

        const selectedOptions = normalizedSelectionResult.value;
        const optionDocs =
          optionsByCategoryId.get(toIdString(product.categoryId)) || [];

        if (!optionDocs.length) {
          return res.status(400).json({
            message: `items[${index}] is CUSTOMIZABLE but no options were configured for this product.`,
          });
        }

        const optionMap = buildOptionMaps(optionDocs);
        const selectedCountByOption = new Map();

        for (const selectedOption of selectedOptions) {
          const optionKey = selectedOption.optionName.toLowerCase();
          const optionDoc = optionMap.get(optionKey);

          if (!optionDoc) {
            return res.status(400).json({
              message: `items[${index}] option ${selectedOption.optionName} is not valid for product ${product.name}.`,
            });
          }

          const choiceDoc = findChoiceByName(
            optionDoc,
            selectedOption.choiceName,
          );

          if (!choiceDoc) {
            return res.status(400).json({
              message: `items[${index}] choice ${selectedOption.choiceName} is not valid for option ${optionDoc.name}.`,
            });
          }

          if (optionDoc.perLayer && selectedOption.layer === undefined) {
            return res.status(400).json({
              message: `items[${index}] option ${optionDoc.name} is perLayer and requires layer in selectedOptions.`,
            });
          }

          const previousCount = selectedCountByOption.get(optionKey) || 0;
          const nextCount = previousCount + 1;
          selectedCountByOption.set(optionKey, nextCount);

          if (
            optionDoc.maxSelections !== undefined &&
            optionDoc.maxSelections !== null &&
            nextCount > Number(optionDoc.maxSelections)
          ) {
            return res.status(400).json({
              message: `items[${index}] option ${optionDoc.name} exceeds maxSelections ${optionDoc.maxSelections}.`,
            });
          }

          finalUnitPrice += Number(choiceDoc.extraPrice || 0);

          const selectedSnapshot = {
            optionName: optionDoc.name,
            choiceName: choiceDoc.name,
            ingredientId: choiceDoc.ingredientId,
            quantity: Number(choiceDoc.quantity),
            layer: selectedOption.layer,
          };

          orderItem.selectedOptions.push(selectedSnapshot);

          const requiredQuantity = roundQuantity(
            Number(choiceDoc.quantity) * quantity,
          );
          addIngredientUsage(
            ingredientUsageMap,
            choiceDoc.ingredientId,
            requiredQuantity,
          );
        }

        for (const optionDoc of optionDocs) {
          const selectedCount =
            selectedCountByOption.get(optionDoc.name.toLowerCase()) || 0;
          if (optionDoc.required && selectedCount === 0) {
            return res.status(400).json({
              message: `items[${index}] missing required option ${optionDoc.name} for product ${product.name}.`,
            });
          }
        }
      }

      orderItem.finalPrice = roundQuantity(finalUnitPrice * quantity);
      totalPrice = roundQuantity(totalPrice + orderItem.finalPrice);
      orderItems.push(orderItem);
    }

    const allIngredients = await Ingredient.find({ bakeryId }).lean();
    const ingredientMap = new Map(
      allIngredients.map((ingredient) => [
        toIdString(ingredient._id),
        ingredient,
      ]),
    );

    const rawIngredientUsageMap = new Map();

    for (const [ingredientId, quantity] of ingredientUsageMap.entries()) {
      expandIngredientToRaw({
        ingredientId,
        quantity,
        ingredientMap,
        rawUsageMap: rawIngredientUsageMap,
      });
    }

    const rawIngredientIds = [...rawIngredientUsageMap.keys()];

    const inventoryRows = await BakeryInventory.find({
      bakeryId,
      ingredientId: { $in: rawIngredientIds },
    })
      .select("ingredientId quantityAvailable")
      .lean();

    const inventoryMap = new Map(
      inventoryRows.map((row) => [
        toIdString(row.ingredientId),
        row.quantityAvailable,
      ]),
    );

    const insufficientInventory = [];

    for (const [
      ingredientId,
      requiredQuantity,
    ] of rawIngredientUsageMap.entries()) {
      const availableQuantity = Number(inventoryMap.get(ingredientId) || 0);

      if (availableQuantity < requiredQuantity) {
        const ingredientDoc = ingredientMap.get(ingredientId);
        insufficientInventory.push({
          ingredientId,
          ingredientName: ingredientDoc?.name || "Unknown ingredient",
          requiredQuantity,
          availableQuantity,
          unit: ingredientDoc?.unit || null,
        });
      }
    }

    if (insufficientInventory.length > 0) {
      return res.status(400).json({
        message: "Insufficient inventory for one or more ingredients.",
        insufficientInventory,
      });
    }

    for (const [
      ingredientId,
      requiredQuantity,
    ] of rawIngredientUsageMap.entries()) {
      const updatedInventory = await BakeryInventory.findOneAndUpdate(
        {
          bakeryId,
          ingredientId,
          quantityAvailable: { $gte: requiredQuantity },
        },
        { $inc: { quantityAvailable: -requiredQuantity } },
        { new: true },
      );

      if (!updatedInventory) {
        await rollbackDeductions(bakeryId, deductions);

        const currentInventory = await BakeryInventory.findOne({
          bakeryId,
          ingredientId,
        })
          .select("quantityAvailable")
          .lean();

        const ingredientDoc = ingredientMap.get(ingredientId);

        return res.status(400).json({
          message:
            "Inventory changed while placing order. Please retry with latest stock.",
          insufficientInventory: [
            {
              ingredientId,
              ingredientName: ingredientDoc?.name || "Unknown ingredient",
              requiredQuantity,
              availableQuantity: Number(
                currentInventory?.quantityAvailable || 0,
              ),
              unit: ingredientDoc?.unit || null,
            },
          ],
        });
      }

      deductions.push({ ingredientId, quantity: requiredQuantity });
    }

    let order;

    try {
      order = await Order.create({
        userId: customer._id,
        bakeryId,
        items: orderItems,
        totalPrice,
      });
    } catch (createOrderError) {
      await rollbackDeductions(bakeryId, deductions);

      return res.status(500).json({
        message: "Error saving order after stock deduction.",
        error: createOrderError.message,
      });
    }

    const rawIngredientsUsed = rawIngredientIds.map((ingredientId) => {
      const ingredientDoc = ingredientMap.get(ingredientId);
      return {
        ingredientId,
        name: ingredientDoc?.name || "Unknown ingredient",
        unit: ingredientDoc?.unit || null,
        quantityUsed: rawIngredientUsageMap.get(ingredientId),
      };
    });

    const emailItems = orderItems.map((item) => {
      const product = productById.get(toIdString(item.productId));

      return {
        productName: product?.name || "Product",
        quantity: item.quantity,
        finalPrice: item.finalPrice,
        selectedOptions: (item.selectedOptions || []).map((option) => ({
          optionName: option.optionName,
          choiceName: option.choiceName,
          layer: option.layer,
        })),
      };
    });

    const emailResult = await sendOrderConfirmationEmail({
      to: customer.email,
      customerName: customer.name,
      orderId: toIdString(order._id),
      bakeryName: bakery.name,
      createdAt: order.createdAt,
      items: emailItems,
      totalPrice: order.totalPrice,
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order: serializeOrder(order),
      inventoryImpact: {
        rawIngredientsUsed,
      },
      emailNotification: {
        sent: emailResult.sent,
        reason: emailResult.sent ? null : emailResult.reason,
      },
    });
  } catch (error) {
    if (deductions.length > 0) {
      await rollbackDeductions(req.body?.bakeryId, deductions);
    }

    return res.status(500).json({
      message: "Error placing order.",
      error: error.message,
    });
  }
};
