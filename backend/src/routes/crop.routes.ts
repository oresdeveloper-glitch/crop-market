import { Router } from "express";
import { createCrop, getAllCrops, getCropById, updateCrop, deleteCrop } from "../controllers/crop.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { cropListingSchema } from "../utils/schemas";

const router = Router();

router.post("/", authenticate, authorize("FARMER"), validate(cropListingSchema), createCrop);
router.get("/", getAllCrops);
router.get("/:id", getCropById);
router.put("/:id", authenticate, authorize("FARMER", "ADMIN"), updateCrop);
router.delete("/:id", authenticate, authorize("FARMER", "ADMIN"), deleteCrop);

export default router;
