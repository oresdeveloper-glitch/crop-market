import { Router } from "express";
import { upload, uploadImage, uploadBase64Image } from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/image", authenticate, upload.single("file"), uploadImage);
router.post("/base64", authenticate, uploadBase64Image);

export default router;
