import express from "express";
import {
  getTopOrdersBakery,
  getTopRevenueBakery,
  listAdminBakeries,
  listGlobalCategories,
  updateBakeryApproval,
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/bakeries", listAdminBakeries);
router.patch("/bakeries/:bakeryId/approval", updateBakeryApproval);
router.get("/bakeries/top-orders", getTopOrdersBakery);
router.get("/bakeries/top-revenue", getTopRevenueBakery);
router.get("/categories", listGlobalCategories);

export default router;