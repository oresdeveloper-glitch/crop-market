import { Response } from "express";
import { AuthRequest } from "../types";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuid()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) { res.status(400).json({ error: "No image provided" }); return; }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
}

export async function uploadBase64Image(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { image } = req.body;
    if (!image) { res.status(400).json({ error: "No image data" }); return; }
    const matches = image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
    if (!matches) { res.status(400).json({ error: "Invalid base64 image" }); return; }
    const ext = matches[1] === "png" ? ".png" : ".jpg";
    const filename = `${uuid()}${ext}`;
    const fs = await import("fs");
    fs.writeFileSync(path.join(__dirname, "../../uploads", filename), matches[2], "base64");
    res.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Base64 upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
}
