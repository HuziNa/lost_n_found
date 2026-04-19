import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { requireAuth, requireCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, requireCustomer, placeOrder);

export default router;
