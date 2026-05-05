import express from "express";
import {
  createBakeryReview,
  createBakeryIngredient,
  createBakeryProduct,
  deleteBakeryProduct,
  getBakeryMenuProductsByBakeryId,
  getBakeryMenuProductById,
  getBakeryAnalytics,
  listPublicBakeries,
  listBakeryCategories,
  listPublicBakeryCategories,
  listBakeryIngredients,
  listBakeryPastOrders,
  listBakeryProducts,
  listBakeryReviews,
  listBakeryVouchers,
  createBakeryVoucher,
  updateBakeryVoucher,
  deleteBakeryVoucher,
  updateBakeryProfile,
  updateBakeryOrderStatus,
  updateBakeryProduct,
  updateBakeryIngredient,
  deleteBakeryIngredient,
  validateBakeryVoucher,
} from "../controllers/bakeryController.js";
import {
  requireAuth,
  requireBakeryOwner,
  requireCustomer,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public bakery list endpoint for discovery.
router.get("/public", listPublicBakeries);

// Public menu list endpoint for frontend product grids.
router.get("/menu/:bakeryId/products", getBakeryMenuProductsByBakeryId);

// Public product-details endpoint for menu rendering.
router.get("/products/:productId", getBakeryMenuProductById);

// Public bakery reviews endpoint (requires bakeryId query param).
router.get("/reviews", listBakeryReviews);

// Public categories list (Storefront)
router.get("/categories/public/:bakeryId", listPublicBakeryCategories);

// Customer review submission endpoint.
router.post("/reviews", requireAuth, requireCustomer, createBakeryReview);

// Public voucher validation endpoint.
router.get("/vouchers/validate/:code", validateBakeryVoucher);

router.use(requireAuth, requireBakeryOwner);

// Protected Category list
router.get("/categories", listBakeryCategories);

router.patch("/profile", updateBakeryProfile);

router.get("/ingredients", listBakeryIngredients);
router.post("/ingredients", createBakeryIngredient);
router.patch("/ingredients/:ingredientId", updateBakeryIngredient);
router.delete("/ingredients/:ingredientId", deleteBakeryIngredient);

router.get("/orders", listBakeryPastOrders);
router.patch("/orders/:orderId/status", updateBakeryOrderStatus);

router.get("/analytics", getBakeryAnalytics);

router.get("/products", listBakeryProducts);
router.post("/products", createBakeryProduct);
router.patch("/products/:productId", updateBakeryProduct);
router.delete("/products/:productId", deleteBakeryProduct);

router.get("/vouchers", listBakeryVouchers);
router.post("/vouchers", createBakeryVoucher);
router.patch("/vouchers/:voucherId", updateBakeryVoucher);
router.delete("/vouchers/:voucherId", deleteBakeryVoucher);

export default router;