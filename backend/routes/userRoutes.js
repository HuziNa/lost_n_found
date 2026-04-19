import express from "express";
import {
  getMyDetails,
  getMyPastOrders,
  updateMyAccount,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", requireAuth, getMyDetails);
router.patch("/me", requireAuth, updateMyAccount);
router.get("/me/orders", requireAuth, getMyPastOrders);

export default router;
