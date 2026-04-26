import mongoose from "mongoose";
import Bakery from "../models/Bakery.js";
import BakeryInventory from "../models/BakeryInventory.js";
import Ingredient from "../models/Ingredients.js";
import Order from "../models/Order.js";
import ProductOption from "../models/ProductOption.js";
import Product from "../models/Products.js";
import User from "../models/User.js";
import Voucher from "../models/Voucher.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

const PRODUCT_TYPE_FIXED = "FIXED";
const PRODUCT_TYPE_CUSTOMIZABLE = "CUSTOMIZABLE";
const DELIVERY_FREE_THRESHOLD = 2000;

const toIdString = (value) => (value ? value.toString() : null);
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const roundQuantity = (value) => Number(Number(value).toFixed(6));

const normalizeOrderItemSelection = (selectedOptions) => {
  if (!Array.isArray(selectedOptions)) {
    return { error: "selectedOptions must be an array for CUSTOMIZABLE products." };
  }
  if (selectedOptions.length === 0) {
    return { error: "selectedOptions is required for CUSTOMIZABLE products and cannot be empty." };
  }

  const normalized = [];
  for (const selectedOption of selectedOptions) {
    const optionName = String(selectedOption?.optionName || "").trim();
    const choiceName = String(selectedOption?.choiceName || "").trim();
    if (!optionName || !choiceName) {
      return { error: "Each selected option must include optionName and choiceName." };
    }
    const layerRaw = selectedOption?.layer;
    let layer;
    if (layerRaw !== undefined && layerRaw !== null && String(layerRaw).trim() !== "") {
      const parsedLayer = Number(layerRaw);
      if (!Number.isInteger(parsedLayer) || parsedLayer <= 0) {
        return { error: "layer must be a positive integer when provided in selectedOptions." };
      }
      layer = parsedLayer;
    }
    normalized.push({ optionName, choiceName, layer });
  }
  return { value: normalized };
};

// ── NEW: validate delivery/payment fields from request body ───────────────────
const validateDeliveryPayload = (payload) => {
  const VALID_DELIVERY_OPTIONS = ["standard", "express", "pickup"];
  const VALID_PAYMENT_METHODS = ["cod", "bank"];

  const deliveryOption = payload?.deliveryOption || "standard";
  const paymentMethod  = payload?.paymentMethod  || "cod";

  if (!VALID_DELIVERY_OPTIONS.includes(deliveryOption)) {
    return { error: `deliveryOption must be one of: ${VALID_DELIVERY_OPTIONS.join(", ")}.` };
  }
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: `paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(", ")}.` };
  }

  const deliveryFeeValue = Number(payload?.deliveryFee || 0);
  if (!Number.isFinite(deliveryFeeValue) || deliveryFeeValue < 0) {
    return { error: "deliveryFee must be a non-negative number." };
  }

  // Only require address fields when not picking up
  if (deliveryOption !== "pickup") {
    if (!payload?.deliveryAddress?.street?.trim()) {
      return { error: "deliveryAddress.street is required for delivery orders." };
    }
    if (!payload?.deliveryAddress?.city?.trim()) {
      return { error: "deliveryAddress.city is required for delivery orders." };
    }
  }

  return {
    value: {
      deliveryOption,
      deliveryFee: deliveryFeeValue,
      paymentMethod,
      customerPhone: String(payload?.customerPhone || "").trim(),
      deliveryInstructions: String(payload?.deliveryInstructions || "").trim(),
      deliveryAddress: {
        street:     String(payload?.deliveryAddress?.street     || "").trim(),
        city:       String(payload?.deliveryAddress?.city       || "").trim(),
        postalCode: String(payload?.deliveryAddress?.postalCode || "").trim(),
      },
    },
  };
};

const validateOrderPayload = (payload) => {
  const bakeryId = payload?.bakeryId;
  const items    = payload?.items;

  if (!bakeryId || !isValidObjectId(bakeryId)) {
    return { error: "bakeryId is required and must be a valid id." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "items must be a non-empty array." };
  }

  const normalizedItems = [];
  for (let index = 0; index < items.length; index += 1) {
    const item     = items[index];
    const productId = item?.productId;
    const quantity  = Number(item?.quantity);

    if (!productId || !isValidObjectId(productId)) {
      return { error: `items[${index}].productId must be a valid id.` };
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: `items[${index}].quantity must be greater than 0.` };
    }
    const roundedQuantity = roundQuantity(quantity);
    if (roundedQuantity <= 0) {
      return { error: `items[${index}].quantity must be greater than 0.` };
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
      voucherCode: String(payload?.voucherCode || "").trim().toUpperCase(),
    },
  };
};

const buildOptionMaps = (optionDocs) => {
  const optionMap = new Map();
  for (const optionDoc of optionDocs) {
    const key = optionDoc.name.toLowerCase();
    if (!optionMap.has(key)) optionMap.set(key, optionDoc);
  }
  return optionMap;
};

const findChoiceByName = (optionDoc, choiceName) => {
  const normalized = choiceName.toLowerCase();
  return (optionDoc.choices || []).find(
    (choice) => String(choice.name || "").toLowerCase() === normalized
  );
};

const serializeOrder = (orderDoc) => ({
  id:         toIdString(orderDoc._id),
  userId:     toIdString(orderDoc.userId),
  bakeryId:   toIdString(orderDoc.bakeryId),
  totalPrice: orderDoc.totalPrice,
  itemsTotal: orderDoc.itemsTotal || 0,
  voucherCode: orderDoc.voucherCode || "",
  discountAmount: orderDoc.discountAmount || 0,
  discountType: orderDoc.discountType || "fixed",
  status:     orderDoc.status,
  // ── delivery/payment fields ──────────────────────────────────────────────
  deliveryOption:       orderDoc.deliveryOption,
  deliveryFee:          orderDoc.deliveryFee,
  deliveryAddress:      orderDoc.deliveryAddress,
  deliveryInstructions: orderDoc.deliveryInstructions,
  customerPhone:        orderDoc.customerPhone,
  paymentMethod:        orderDoc.paymentMethod,
  // ────────────────────────────────────────────────────────────────────────
  items: (orderDoc.items || []).map((item) => ({
    productId:  toIdString(item.productId),
    productName: item.productName || "",
    quantity:   item.quantity,
    finalPrice: item.finalPrice,
    selectedOptions: (item.selectedOptions || []).map((option) => ({
      optionName:   option.optionName,
      choiceName:   option.choiceName,
      ingredientId: toIdString(option.ingredientId),
      quantity:     option.quantity,
      layer:        option.layer,
    })),
  })),
  createdAt: orderDoc.createdAt,
  updatedAt: orderDoc.updatedAt,
});

const addIngredientUsage = (usageMap, ingredientId, quantity) => {
  const id  = toIdString(ingredientId);
  const prev = usageMap.get(id) || 0;
  usageMap.set(id, roundQuantity(prev + quantity));
};

const rollbackDeductions = async (bakeryId, deductions) => {
  if (!deductions.length) return;
  await Promise.all(
    deductions.map((d) =>
      BakeryInventory.updateOne(
        { bakeryId, ingredientId: d.ingredientId },
        { $inc: { quantityAvailable: d.quantity } }
      )
    )
  );
};

const expandIngredientToRaw = ({ ingredientId, quantity, ingredientMap, rawUsageMap, path = [] }) => {
  const id         = toIdString(ingredientId);
  const ingredient = ingredientMap.get(id);

  if (!ingredient) throw new Error(`Ingredient ${id} was not found while expanding recipes.`);
  if (path.includes(id)) throw new Error(`Circular ingredient recipe detected at ingredient ${id}.`);

  const recipe   = ingredient.recipe || [];
  const nextPath = [...path, id];

  if (recipe.length === 0) {
    addIngredientUsage(rawUsageMap, id, quantity);
    return;
  }

  for (const entry of recipe) {
    expandIngredientToRaw({
      ingredientId: entry.ingredientId,
      quantity:     roundQuantity(quantity * Number(entry.quantity)),
      ingredientMap,
      rawUsageMap,
      path: nextPath,
    });
  }
};

// ── POST /api/orders ───────────────────────────────────────────────────────────
// Body now also accepts:
//   deliveryOption: "standard" | "express" | "pickup"
//   deliveryFee: Number
//   paymentMethod: "cod" | "bank"
//   customerPhone: String
//   deliveryInstructions: String
//   deliveryAddress: { street, city, postalCode }
export const placeOrder = async (req, res) => {
  const deductions = [];

  try {
    // 1) Validate core order fields (bakeryId + items)
    const payloadResult = validateOrderPayload(req.body);
    if (payloadResult.error) {
      return res.status(400).json({ message: payloadResult.error });
    }

    // 2) Validate delivery/payment fields  ← NEW
    const deliveryResult = validateDeliveryPayload(req.body);
    if (deliveryResult.error) {
      return res.status(400).json({ message: deliveryResult.error });
    }

    const { bakeryId, items, voucherCode } = payloadResult.value;
    const deliveryData = deliveryResult.value;

    const customer = await User.findById(req.authUser.id).select("_id role name email");
    if (!customer) return res.status(404).json({ message: "Customer not found." });
    if (customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can place orders." });
    }

    const bakery = await Bakery.findById(bakeryId).select("_id isActive name");
    if (!bakery) return res.status(404).json({ message: "Bakery not found." });
    if (!bakery.isActive) {
      return res.status(400).json({ message: "This bakery is currently inactive and cannot accept orders." });
    }

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: uniqueProductIds }, bakeryId, isActive: true }).lean();

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({
        message: "Some products are invalid, inactive, or do not belong to the selected bakery.",
      });
    }

    const productById = new Map(products.map((p) => [toIdString(p._id), p]));
    const customizableProductIds = products
      .filter((p) => p.type === PRODUCT_TYPE_CUSTOMIZABLE)
      .map((p) => p._id);

    const productOptions = await ProductOption.find({ productId: { $in: customizableProductIds } }).lean();
    const optionsByProductId = new Map();
    for (const option of productOptions) {
      const key = toIdString(option.productId);
      if (!optionsByProductId.has(key)) optionsByProductId.set(key, []);
      optionsByProductId.get(key).push(option);
    }

    const ingredientUsageMap = new Map();
    const orderItems = [];
    let totalPrice = 0;

    for (const [index, requestedItem] of items.entries()) {
      const product = productById.get(toIdString(requestedItem.productId));
      if (!product) {
        return res.status(400).json({ message: `items[${index}] references an unknown product.` });
      }

      const quantity  = requestedItem.quantity;
      const orderItem = { productId: product._id, productName: product.name, quantity, selectedOptions: [], finalPrice: 0 };
      let finalUnitPrice = Number(product.basePrice);

      if (product.type === PRODUCT_TYPE_FIXED) {
        if (Array.isArray(requestedItem.selectedOptions) && requestedItem.selectedOptions.length > 0) {
          return res.status(400).json({ message: `items[${index}] is FIXED and cannot include selectedOptions.` });
        }
        for (const entry of product.ingredients || []) {
          addIngredientUsage(ingredientUsageMap, entry.ingredientId, roundQuantity(Number(entry.quantity) * quantity));
        }
      }

      if (product.type === PRODUCT_TYPE_CUSTOMIZABLE) {
        const normalizedResult = normalizeOrderItemSelection(requestedItem.selectedOptions);
        if (normalizedResult.error) {
          return res.status(400).json({ message: `items[${index}]: ${normalizedResult.error}` });
        }

        const selectedOptions   = normalizedResult.value;
        const optionDocs        = optionsByProductId.get(toIdString(product._id)) || [];
        if (!optionDocs.length) {
          return res.status(400).json({ message: `items[${index}] is CUSTOMIZABLE but no options were configured.` });
        }

        const optionMap             = buildOptionMaps(optionDocs);
        const selectedCountByOption = new Map();

        for (const selectedOption of selectedOptions) {
          const optionKey = selectedOption.optionName.toLowerCase();
          const optionDoc = optionMap.get(optionKey);
          if (!optionDoc) {
            return res.status(400).json({ message: `items[${index}] option ${selectedOption.optionName} is not valid for product ${product.name}.` });
          }

          const choiceDoc = findChoiceByName(optionDoc, selectedOption.choiceName);
          if (!choiceDoc) {
            return res.status(400).json({ message: `items[${index}] choice ${selectedOption.choiceName} is not valid for option ${optionDoc.name}.` });
          }

          if (optionDoc.perLayer && selectedOption.layer === undefined) {
            return res.status(400).json({ message: `items[${index}] option ${optionDoc.name} is perLayer and requires layer.` });
          }

          const prevCount = selectedCountByOption.get(optionKey) || 0;
          const nextCount = prevCount + 1;
          selectedCountByOption.set(optionKey, nextCount);

          if (optionDoc.maxSelections !== undefined && optionDoc.maxSelections !== null && nextCount > Number(optionDoc.maxSelections)) {
            return res.status(400).json({ message: `items[${index}] option ${optionDoc.name} exceeds maxSelections ${optionDoc.maxSelections}.` });
          }

          finalUnitPrice += Number(choiceDoc.extraPrice || 0);

          orderItem.selectedOptions.push({
            optionName:   optionDoc.name,
            choiceName:   choiceDoc.name,
            ingredientId: choiceDoc.ingredientId,
            quantity:     Number(choiceDoc.quantity),
            layer:        selectedOption.layer,
          });

          addIngredientUsage(ingredientUsageMap, choiceDoc.ingredientId, roundQuantity(Number(choiceDoc.quantity) * quantity));
        }

        for (const optionDoc of optionDocs) {
          const count = selectedCountByOption.get(optionDoc.name.toLowerCase()) || 0;
          if (optionDoc.required && count === 0) {
            return res.status(400).json({ message: `items[${index}] missing required option ${optionDoc.name} for product ${product.name}.` });
          }
        }
      }

      orderItem.finalPrice = roundQuantity(finalUnitPrice * quantity);
      totalPrice           = roundQuantity(totalPrice + orderItem.finalPrice);
      orderItems.push(orderItem);
    }

    const allIngredients = await Ingredient.find({ bakeryId }).lean();
    const ingredientMap  = new Map(allIngredients.map((i) => [toIdString(i._id), i]));
    const rawUsageMap    = new Map();

    for (const [ingredientId, quantity] of ingredientUsageMap.entries()) {
      expandIngredientToRaw({ ingredientId, quantity, ingredientMap, rawUsageMap });
    }

    const rawIngredientIds = [...rawUsageMap.keys()];
    const inventoryRows    = await BakeryInventory.find({ bakeryId, ingredientId: { $in: rawIngredientIds } })
      .select("ingredientId quantityAvailable").lean();
    const inventoryMap = new Map(inventoryRows.map((r) => [toIdString(r.ingredientId), r.quantityAvailable]));

    const insufficient = [];
    for (const [id, required] of rawUsageMap.entries()) {
      const available = Number(inventoryMap.get(id) || 0);
      if (available < required) {
        const doc = ingredientMap.get(id);
        insufficient.push({ ingredientId: id, ingredientName: doc?.name || "Unknown", required, available, unit: doc?.unit || null });
      }
    }
    if (insufficient.length > 0) {
      return res.status(400).json({ message: "Insufficient inventory for one or more ingredients.", insufficientInventory: insufficient });
    }

    for (const [id, required] of rawUsageMap.entries()) {
      const updated = await BakeryInventory.findOneAndUpdate(
        { bakeryId, ingredientId: id, quantityAvailable: { $gte: required } },
        { $inc: { quantityAvailable: -required } },
        { new: true }
      );
      if (!updated) {
        await rollbackDeductions(bakeryId, deductions);
        const current = await BakeryInventory.findOne({ bakeryId, ingredientId: id }).select("quantityAvailable").lean();
        const doc     = ingredientMap.get(id);
        return res.status(400).json({
          message: "Inventory changed while placing order. Please retry.",
          insufficientInventory: [{ ingredientId: id, ingredientName: doc?.name || "Unknown", required, available: Number(current?.quantityAvailable || 0), unit: doc?.unit || null }],
        });
      }
      deductions.push({ ingredientId: id, quantity: required });
    }

    let discountAmount = 0;
    let discountType = "fixed";
    let appliedVoucherCode = "";
    const itemsTotal = roundQuantity(totalPrice);

    if (voucherCode) {
      const voucher = await Voucher.findOne({ bakeryId, code: voucherCode, isActive: true }).lean();
      if (!voucher) {
        return res.status(400).json({ message: "Invalid or inactive voucher code." });
      }

      if (voucher.expiresAt && new Date() > voucher.expiresAt) {
        return res.status(400).json({ message: "Voucher code is expired." });
      }

      if (itemsTotal < Number(voucher.minOrderAmount || 0)) {
        return res.status(400).json({ message: `Order must be at least ${voucher.minOrderAmount} to use this voucher.` });
      }

      if (voucher.discountType === "percent") {
        discountAmount = roundQuantity((itemsTotal * Number(voucher.discountValue)) / 100);
        discountType = "percent";
      } else {
        discountAmount = roundQuantity(Number(voucher.discountValue));
      }

      discountAmount = Math.min(discountAmount, itemsTotal);
      appliedVoucherCode = voucher.code;
    }

    const subtotalAfterDiscount = roundQuantity(itemsTotal - discountAmount);
    let deliveryFee = Number(deliveryData.deliveryFee || 0);
    if (deliveryData.deliveryOption === "pickup") {
      deliveryFee = 0;
    }
    if (subtotalAfterDiscount >= DELIVERY_FREE_THRESHOLD) {
      deliveryFee = 0;
    }

    const finalTotal = roundQuantity(Math.max(0, subtotalAfterDiscount + deliveryFee));

    let order;
    try {
      order = await Order.create({
        userId: customer._id,
        bakeryId,
        items: orderItems,
        totalPrice: finalTotal,
        voucherCode: appliedVoucherCode,
        discountAmount,
        discountType,
        itemsTotal,
        ...deliveryData,
        deliveryFee,
      });
    } catch (err) {
      await rollbackDeductions(bakeryId, deductions);
      return res.status(500).json({ message: "Error saving order after stock deduction.", error: err.message });
    }

    const rawIngredientsUsed = rawIngredientIds.map((id) => {
      const doc = ingredientMap.get(id);
      return { ingredientId: id, name: doc?.name || "Unknown", unit: doc?.unit || null, quantityUsed: rawUsageMap.get(id) };
    });

    const emailResult = await sendOrderConfirmationEmail({
      to:           customer.email,
      customerName: customer.name,
      orderId:      toIdString(order._id),
      bakeryName:   bakery.name,
      createdAt:    order.createdAt,
      items: orderItems.map((item) => {
        const p = productById.get(toIdString(item.productId));
        return {
          productName: p?.name || "Product",
          quantity:    item.quantity,
          finalPrice:  item.finalPrice,
          selectedOptions: (item.selectedOptions || []).map((o) => ({
            optionName: o.optionName,
            choiceName: o.choiceName,
            layer:      o.layer,
          })),
        };
      }),
      totalPrice: order.totalPrice,
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order:   serializeOrder(order),
      inventoryImpact: { rawIngredientsUsed },
      emailNotification: { sent: emailResult.sent, reason: emailResult.sent ? null : emailResult.reason },
    });
  } catch (error) {
    if (deductions.length > 0) await rollbackDeductions(req.body?.bakeryId, deductions);
    return res.status(500).json({ message: "Error placing order.", error: error.message });
  }
};