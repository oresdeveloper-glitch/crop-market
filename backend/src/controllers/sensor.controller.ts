import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";

export async function postSensorData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { deviceId, cropId, temperature, humidity, moisture, colorScore, gasLevel, weightKg } = req.body;

    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      res.status(404).json({ error: "Device not found" });
      return;
    }

    const crop = await prisma.cropListing.findUnique({ where: { id: cropId } });
    if (!crop || (crop.farmerId !== device.farmerId && req.user?.role !== "ADMIN")) {
      res.status(403).json({ error: "Device does not belong to this crop's farmer" });
      return;
    }

    const sensorData = await prisma.sensorData.create({
      data: {
        cropId,
        deviceId,
        temperature,
        humidity,
        moisture,
        colorScore,
        gasLevel,
        weightKg,
      },
    });

    await prisma.device.update({
      where: { id: deviceId },
      data: { lastSeen: new Date() },
    });

    res.status(201).json(sensorData);
  } catch (error) {
    console.error("Post sensor data error:", error);
    res.status(500).json({ error: "Failed to save sensor data" });
  }
}

export async function getSensorData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await prisma.sensorData.findMany({
      where: { cropId: req.params.cropId },
      orderBy: { recordedAt: "desc" },
      take: 100,
    });
    res.json(data);
  } catch (error) {
    console.error("Get sensor data error:", error);
    res.status(500).json({ error: "Failed to fetch sensor data" });
  }
}

export async function getLatestSensorData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await prisma.sensorData.findFirst({
      where: { cropId: req.params.cropId },
      orderBy: { recordedAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    console.error("Get latest sensor data error:", error);
    res.status(500).json({ error: "Failed to fetch latest sensor data" });
  }
}

export async function getLatestAllSensorData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await prisma.sensorData.findFirst({
      orderBy: { recordedAt: "desc" },
      include: { crop: { select: { id: true, cropName: true } } },
    });
    if (!data) { res.json(null); return; }
    const quality = await prisma.qualityAssessment.findFirst({
      where: { cropId: data.cropId },
      orderBy: { assessedAt: "desc" },
    });
    res.json({
      cropId: data.cropId,
      cropName: data.crop?.cropName,
      temperature: data.temperature,
      humidity: data.humidity,
      moisture: data.moisture,
      qualityScore: quality?.finalScore || data.colorScore,
      grade: quality?.grade || "N/A",
      timestamp: data.recordedAt.toISOString(),
    });
  } catch (error) {
    console.error("Get latest all sensor data error:", error);
    res.status(500).json({ error: "Failed to fetch latest sensor data" });
  }
}

export async function publishSensorData(req: AuthRequest, res: Response): Promise<void> {
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

    const { normalizeSensorData, assessCropQuality } = await import("../utils/quality");
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

    const { emitSensorUpdate } = await import("../services/websocket.service");
    emitSensorUpdate({ cropId: crop.id, temperature: payload.temperature, humidity: payload.humidity, moisture: payload.moisture, qualityScore: finalScore, grade, timestamp: new Date().toISOString() });

    res.json({ temperature: payload.temperature, humidity: payload.humidity, moisture: payload.moisture, score: finalScore, grade });
  } catch (error) {
    console.error("Publish sensor data error:", error);
    res.status(500).json({ error: "Failed to publish sensor data" });
  }
}

export async function simulateSensorData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { emitSensorUpdate } = await import("../services/websocket.service");
    const { normalizeSensorData, assessCropQuality } = await import("../utils/quality");

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
    console.error("Simulate error:", error);
    res.status(500).json({ error: "Simulation failed" });
  }
}

export async function uploadCropImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    const imageBuffer = Buffer.concat(buffers);
    const filename = `${uuid()}.jpg`;
    const filepath = path.join(__dirname, "../../uploads", filename);
    fs.writeFileSync(filepath, imageBuffer);
    const url = `/uploads/${filename}`;

    const deviceCode = req.headers["x-device-code"] as string || "ESP32-CAM";
    const device = await prisma.device.findFirst({ where: { deviceCode } });
    if (device) {
      await prisma.device.update({ where: { id: device.id }, data: { lastSeen: new Date() } });
      const crop = await prisma.cropListing.findFirst({
        where: { farmerId: device.farmerId },
        orderBy: { createdAt: "desc" },
      });
      if (crop) {
        await prisma.cropListing.update({ where: { id: crop.id }, data: { imageUrl: url } });
      }
    }

    res.json({ url, filename });
  } catch (error) {
    console.error("Crop image upload error:", error);
    res.status(500).json({ error: "Failed to process crop image" });
  }
}
