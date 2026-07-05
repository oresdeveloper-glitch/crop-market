import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus } from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { orderSchema, updateOrderStatusSchema } from "../utils/schemas";

const router = Router();

router.post("/", authenticate, authorize("BUYER"), validate(orderSchema), createOrder);
router.get("/", authenticate, authorize("BUYER"), getOrders);
router.get("/:id", authenticate, getOrderById);
router.put("/:id/status", authenticate, authorize("FARMER", "ADMIN"), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
