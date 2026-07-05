import { Router } from "express";
import { getProfile, updateProfile, getListings, getOrders, getFarmerById } from "../controllers/farmer.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../utils/schemas";

const router = Router();

router.get("/profile", authenticate, authorize("FARMER"), getProfile);
router.put("/profile", authenticate, authorize("FARMER"), validate(updateProfileSchema), updateProfile);
router.get("/listings", authenticate, authorize("FARMER"), getListings);
router.get("/orders", authenticate, authorize("FARMER"), getOrders);
router.get("/:id", authenticate, getFarmerById);

export default router;
