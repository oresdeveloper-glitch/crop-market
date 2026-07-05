import { Router } from "express";
import { assessQuality, getQuality, getLatestQuality } from "../controllers/quality.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { qualityAssessSchema } from "../utils/schemas";

const router = Router();

router.post("/assess", authenticate, authorize("FARMER", "ADMIN"), validate(qualityAssessSchema), assessQuality);
router.get("/:cropId", authenticate, getQuality);
router.get("/:cropId/latest", authenticate, getLatestQuality);

export default router;
