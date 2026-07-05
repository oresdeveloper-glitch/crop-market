import { Router } from "express";
import {
  getOverview,
  getFarmers,
  getBuyers,
  getAllOrders,
  getAllCrops,
  getSensorMonitoring,
  getReports,
  verifyFarmer,
} from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/overview", authenticate, authorize("ADMIN"), getOverview);
router.get("/farmers", authenticate, authorize("ADMIN"), getFarmers);
router.get("/buyers", authenticate, authorize("ADMIN"), getBuyers);
router.get("/orders", authenticate, authorize("ADMIN"), getAllOrders);
router.get("/crops", authenticate, authorize("ADMIN"), getAllCrops);
router.get("/sensors", authenticate, authorize("ADMIN"), getSensorMonitoring);
router.get("/reports", authenticate, authorize("ADMIN"), getReports);
router.patch("/farmers/:id/verify", authenticate, authorize("ADMIN"), verifyFarmer);

export default router;
