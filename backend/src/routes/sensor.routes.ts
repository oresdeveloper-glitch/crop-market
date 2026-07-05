import { Router } from "express";
import { postSensorData, getSensorData, getLatestSensorData, uploadCropImage, simulateSensorData, getLatestAllSensorData, publishSensorData } from "../controllers/sensor.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { sensorDataSchema } from "../utils/schemas";

const router = Router();

router.post("/sensor-data", authenticate, authorize("FARMER", "ADMIN"), validate(sensorDataSchema), postSensorData);
router.get("/sensor-data/:cropId", authenticate, getSensorData);
router.get("/sensor-data/:cropId/latest", authenticate, getLatestSensorData);
router.post("/crop-image", uploadCropImage);
router.post("/simulate", simulateSensorData);
router.post("/publish", publishSensorData);
router.get("/latest", getLatestAllSensorData);

export default router;
