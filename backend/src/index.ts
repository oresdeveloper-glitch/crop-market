import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import farmerRoutes from "./routes/farmer.routes";
import buyerRoutes from "./routes/buyer.routes";
import cropRoutes from "./routes/crop.routes";
import sensorRoutes from "./routes/sensor.routes";
import qualityRoutes from "./routes/quality.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";
import uploadRoutes from "./routes/upload.routes";
import { Request, Response } from "express";
import prisma from "./utils/prisma";
import { connectMQTT } from "./services/iot.service";
import { initWebSocket } from "./services/websocket.service";
import { normalizeSensorData, assessCropQuality } from "./utils/quality";

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const frontendDist = path.join(__dirname, "../public");
app.use(express.static(frontendDist));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/iot", sensorRoutes);
app.use("/api/quality", qualityRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.post("/api/push-sensor", async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    const device = await prisma.device.findFirst({ orderBy: { lastSeen: "desc" } });
    if (!device) { res.status(404).json({ error: "No device found" }); return; }
    const crop = await prisma.cropListing.findFirst({
      where: { farmerId: device.farmerId, status: { not: "REJECTED" } },
      orderBy: { createdAt: "desc" },
    });
    if (!crop) { res.status(404).json({ error: "No crop found" }); return; }

    await prisma.sensorData.create({
      data: {
        cropId: crop.id, deviceId: device.id,
        temperature: payload.temperature, humidity: payload.humidity, moisture: payload.moisture,
        colorScore: payload.score || payload.colorScore || 0, gasLevel: payload.score || 50, weightKg: payload.weightKg || 1.0,
      },
    });
    await prisma.device.update({ where: { id: device.id }, data: { lastSeen: new Date() } });

    const { normalizeSensorData, assessCropQuality } = await import("./utils/quality");
    const scores = normalizeSensorData({
      temperature: payload.temperature, humidity: payload.humidity, moisture: payload.moisture,
      colorScore: payload.score || payload.colorScore || 0, gasLevel: payload.gasLevel || 50, weightKg: payload.weightKg || 1.0,
    });
    const result = assessCropQuality(scores);
    const grade = payload.grade || result.grade;
    const finalScore = payload.score || result.finalScore;

    await prisma.qualityAssessment.create({
      data: { cropId: crop.id, ...scores, finalScore, grade,
        remarks: grade === "A" ? "Premium quality" : grade === "B" ? "Standard quality" : "Low quality",
      },
    });
    await prisma.cropListing.update({
      where: { id: crop.id },
      data: { qualityGrade: grade, qualityScore: finalScore },
    });

    if (!crop.imageUrl) {
      const images = [
        "https://images.unsplash.com/photo-1574323347407-f5e1c892fb79?w=400",
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
        "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400",
      ];
      await prisma.cropListing.update({ where: { id: crop.id }, data: { imageUrl: images[Math.floor(Math.random() * images.length)] } });
    }

    const { emitSensorUpdate } = await import("./services/websocket.service");
    emitSensorUpdate({ cropId: crop.id, temperature: payload.temperature, humidity: payload.humidity, moisture: payload.moisture, qualityScore: finalScore, grade, timestamp: new Date().toISOString() });

    res.json({ temperature: payload.temperature, humidity: payload.humidity, moisture: payload.moisture, score: finalScore, grade });
  } catch (error) {
    console.error("Ingest error:", error);
    res.status(500).json({ error: "Failed to ingest sensor data" });
  }
});

app.post("/api/gen-data", async (req: Request, res: Response): Promise<void> => {
  try {
    const { emitSensorUpdate } = await import("./services/websocket.service");
    const { normalizeSensorData, assessCropQuality } = await import("./utils/quality");

    const device = await prisma.device.findFirst({ orderBy: { lastSeen: "desc" } });
    if (!device) { res.status(404).json({ error: "No device found" }); return; }

    const crop = await prisma.cropListing.findFirst({
      where: { farmerId: device.farmerId, status: { not: "REJECTED" } },
      orderBy: { createdAt: "desc" },
    });
    if (!crop) { res.status(404).json({ error: "No crop found" }); return; }

    const temp = +(20 + Math.random() * 15).toFixed(1);
    const hum = +(55 + Math.random() * 25).toFixed(1);
    const moist = +(40 + Math.random() * 40).toFixed(1);
    const score = +(60 + Math.random() * 35).toFixed(1);
    const grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";

    await prisma.sensorData.create({
      data: { cropId: crop.id, deviceId: device.id, temperature: temp, humidity: hum, moisture: moist, colorScore: score, gasLevel: score, weightKg: 1.0 },
    });
    await prisma.device.update({ where: { id: device.id }, data: { lastSeen: new Date() } });

    const scores = normalizeSensorData({ temperature: temp, humidity: hum, moisture: moist, colorScore: score, gasLevel: 50, weightKg: 1.0 });
    const result = assessCropQuality(scores);

    await prisma.qualityAssessment.create({
      data: { cropId: crop.id, ...scores, finalScore: score, grade, remarks: grade === "A" ? "Premium quality" : grade === "B" ? "Standard quality" : "Low quality" },
    });
    await prisma.cropListing.update({ where: { id: crop.id }, data: { qualityGrade: grade, qualityScore: score } });

    if (!crop.imageUrl) {
      const images = [
        "https://images.unsplash.com/photo-1574323347407-f5e1c892fb79?w=400",
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
        "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400",
      ];
      await prisma.cropListing.update({ where: { id: crop.id }, data: { imageUrl: images[Math.floor(Math.random() * images.length)] } });
    }

    emitSensorUpdate({ cropId: crop.id, temperature: temp, humidity: hum, moisture: moist, qualityScore: score, grade, timestamp: new Date().toISOString() });

    res.json({ temperature: temp, humidity: hum, moisture: moist, score, grade });
  } catch (error) {
    console.error("Mock error:", error);
    res.status(500).json({ error: "Mock failed" });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initWebSocket(server);
  connectMQTT();

  async function autoGenerateSensorData() {
    try {
      const devices = await prisma.device.findMany();
      for (const device of devices) {
        const crop = await prisma.cropListing.findFirst({
          where: { farmerId: device.farmerId, status: { not: "REJECTED" } },
          orderBy: { createdAt: "desc" },
        });
        if (!crop) continue;

        const temp = +(20 + Math.random() * 15).toFixed(1);
        const hum = +(55 + Math.random() * 25).toFixed(1);
        const moist = +(40 + Math.random() * 40).toFixed(1);
        const score = +(60 + Math.random() * 35).toFixed(1);
        const grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";

        await prisma.sensorData.create({
          data: { cropId: crop.id, deviceId: device.id, temperature: temp, humidity: hum, moisture: moist, colorScore: score, gasLevel: score, weightKg: 1.0 },
        });
        await prisma.device.update({ where: { id: device.id }, data: { lastSeen: new Date() } });

        const scores = normalizeSensorData({ temperature: temp, humidity: hum, moisture: moist, colorScore: score, gasLevel: 50, weightKg: 1.0 });
        const result = assessCropQuality(scores);

        await prisma.qualityAssessment.create({
          data: { cropId: crop.id, ...scores, finalScore: score, grade, remarks: grade === "A" ? "Premium quality" : grade === "B" ? "Standard quality" : "Low quality" },
        });
        await prisma.cropListing.update({ where: { id: crop.id }, data: { qualityGrade: grade, qualityScore: score } });

        if (!crop.imageUrl) {
          const images = [
            "https://images.unsplash.com/photo-1574323347407-f5e1c892fb79?w=400",
            "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400",
          ];
          await prisma.cropListing.update({ where: { id: crop.id }, data: { imageUrl: images[Math.floor(Math.random() * images.length)] } });
        }

        const { emitSensorUpdate } = await import("./services/websocket.service");
        emitSensorUpdate({ cropId: crop.id, temperature: temp, humidity: hum, moisture: moist, qualityScore: score, grade, timestamp: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Auto-generate sensor data error:", err);
    }
  }

  autoGenerateSensorData();
  setInterval(autoGenerateSensorData, 30000);
});

export default app;
