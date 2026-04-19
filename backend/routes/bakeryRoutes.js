import express from "express";
import {
  addIngredientStock,
  createBakeryReview,
  createBakeryIngredient,
  createBakeryProduct,
  deleteBakeryProduct,
  getBakeryMenuProductsByBakeryId,
  getBakeryMenuProductById,
  getBakeryAnalytics,
  listBakeryIngredients,
  listBakeryPastOrders,
  listBakeryProducts,
  listBakeryReviews,
  updateBakeryOrderStatus,
  updateBakeryProduct,
} from "../controllers/bakeryController.js";
import {
  requireAuth,
  requireBakeryOwner,
  requireCustomer,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public menu list endpoint for frontend product grids.
router.get("/menu/:bakeryId/products", getBakeryMenuProductsByBakeryId);

// Public product-details endpoint for menu rendering.
router.get("/products/:productId", getBakeryMenuProductById);

// Public bakery reviews endpoint (requires bakeryId query param).
router.get("/reviews", listBakeryReviews);

// Customer review submission endpoint.
router.post("/reviews", requireAuth, requireCustomer, createBakeryReview);

router.use(requireAuth, requireBakeryOwner);

router.get("/ingredients", listBakeryIngredients);
router.post("/ingredients", createBakeryIngredient);
router.post("/ingredients/stock", addIngredientStock);

router.get("/orders", listBakeryPastOrders);
router.patch("/orders/:orderId/status", updateBakeryOrderStatus);

router.get("/analytics", getBakeryAnalytics);

router.get("/products", listBakeryProducts);
router.post("/products", createBakeryProduct);
router.patch("/products/:productId", updateBakeryProduct);
router.delete("/products/:productId", deleteBakeryProduct);

export default router;
