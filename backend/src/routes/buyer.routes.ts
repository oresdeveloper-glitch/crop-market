import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/buyer.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../utils/schemas";

const router = Router();

router.get("/profile", authenticate, authorize("BUYER"), getProfile);
router.put("/profile", authenticate, authorize("BUYER"), validate(updateProfileSchema), updateProfile);

export default router;
