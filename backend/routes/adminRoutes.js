import express from "express";
import {
  getTopOrdersBakery,
  getTopRevenueBakery,
  listAdminBakeries,
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/bakeries", listAdminBakeries);
router.get("/bakeries/top-orders", getTopOrdersBakery);
router.get("/bakeries/top-revenue", getTopRevenueBakery);

export default router;
