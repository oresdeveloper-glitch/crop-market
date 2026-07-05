import mqtt from "mqtt";
import prisma from "../utils/prisma";
import { assessCropQuality, normalizeSensorData } from "../utils/quality";
import { emitSensorUpdate } from "./websocket.service";

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com:1883";

let client: mqtt.MqttClient | null = null;

export function connectMQTT(): void {
  try {
    client = mqtt.connect(MQTT_BROKER_URL);

    client.on("connect", () => {
      console.log("MQTT connected");
      client?.subscribe("farm/+/device/+/sensor-data", { qos: 1 });
      client?.subscribe("farm/+/device/+/status", { qos: 1 });
      client?.subscribe("crop/quality/data", { qos: 1 });
    });

    client.on("message", async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (topic === "crop/quality/data") {
          await handleSimpleSensorData(payload);
          return;
        }
        const topicParts = topic.split("/");
        const farmerId = topicParts[1];
        const deviceCode = topicParts[3];
        const subTopic = topicParts[4];

        if (subTopic === "sensor-data") {
          await handleSensorData(farmerId, deviceCode, payload);
        } else if (subTopic === "status") {
          await handleDeviceStatus(deviceCode, payload);
        }
      } catch (error) {
        console.error("MQTT message handling error:", error);
      }
    });

    client.on("error", (error) => {
      console.error("MQTT error:", error);
    });
  } catch (error) {
    console.error("MQTT connection error:", error);
  }
}

async function handleSensorData(farmerId: string, deviceCode: string, payload: any): Promise<void> {
  const device = await prisma.device.findFirst({
    where: { deviceCode, farmer: { id: farmerId } },
  });
  if (!device) return;

  const sensorRecord = await prisma.sensorData.create({
    data: {
      cropId: payload.cropId,
      deviceId: device.id,
      temperature: payload.temperature,
      humidity: payload.humidity,
      moisture: payload.moisture,
      colorScore: payload.colorScore,
      gasLevel: payload.gasLevel,
      weightKg: payload.weightKg,
    },
  });

  await prisma.device.update({
    where: { id: device.id },
    data: { lastSeen: new Date() },
  });

  const scores = normalizeSensorData(payload);
  const result = assessCropQuality(scores);

  await prisma.qualityAssessment.create({
    data: {
      cropId: payload.cropId,
      ...scores,
      finalScore: result.finalScore,
      grade: result.grade,
      remarks: result.grade === "A"
        ? "Good quality crop suitable for premium market"
        : result.grade === "B"
        ? "Average quality crop, suitable for standard market"
        : "Low quality crop, consider alternative use",
    },
  });

  await prisma.cropListing.update({
    where: { id: payload.cropId },
    data: { qualityGrade: result.grade, qualityScore: result.finalScore },
  });

  emitSensorUpdate({
    cropId: payload.cropId,
    temperature: payload.temperature,
    humidity: payload.humidity,
    moisture: payload.moisture,
    qualityScore: result.finalScore,
    grade: result.grade,
    timestamp: new Date().toISOString(),
  });
}

const CROP_IMAGES = [
  "https://images.unsplash.com/photo-1574323347407-f5e1c892fb79?w=400",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
  "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=400",
  "https://images.unsplash.com/photo-1595257841889-ec6f15e7e2b1?w=400",
  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400",
  "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
  "https://images.unsplash.com/photo-1595508064774-5ff825ff1f56?w=400",
  "https://images.unsplash.com/photo-1615485290405-1b8e4e2fe690?w=400",
  "https://images.unsplash.com/photo-1582827094979-db5c0e0d4677?w=400",
  "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400",
];

async function assignCropImage(cropId: string): Promise<void> {
  const idx = Math.floor(Math.random() * CROP_IMAGES.length);
  await prisma.cropListing.update({
    where: { id: cropId },
    data: { imageUrl: CROP_IMAGES[idx] },
  });
}

async function handleSimpleSensorData(payload: any): Promise<void> {
  console.log("Simple sensor data received:", JSON.stringify(payload));
  const device = await prisma.device.findFirst({ orderBy: { lastSeen: "desc" } });
  if (!device) {
    console.log("No device found, cannot persist sensor data");
    return;
  }

  const crop = await prisma.cropListing.findFirst({
    where: { farmerId: device.farmerId, status: { not: "REJECTED" } },
    orderBy: { createdAt: "desc" },
  });
  if (!crop) {
    console.log("No crop found for farmer", device.farmerId);
    return;
  }

  const sensorRecord = await prisma.sensorData.create({
    data: {
      cropId: crop.id,
      deviceId: device.id,
      temperature: payload.temperature,
      humidity: payload.humidity,
      moisture: payload.moisture,
      colorScore: payload.score,
      gasLevel: payload.score,
      weightKg: 1.0,
    },
  });

  await prisma.device.update({
    where: { id: device.id },
    data: { lastSeen: new Date() },
  });

  const scores = normalizeSensorData({
    temperature: payload.temperature,
    humidity: payload.humidity,
    moisture: payload.moisture,
    colorScore: payload.score,
    gasLevel: payload.gasLevel || 50,
    weightKg: payload.weightKg || 1.0,
  });
  const result = assessCropQuality(scores);

  await prisma.qualityAssessment.create({
    data: {
      cropId: crop.id,
      ...scores,
      finalScore: payload.score,
      grade: payload.grade,
      remarks: payload.grade === "A"
        ? "Good quality crop suitable for premium market"
        : payload.grade === "B"
        ? "Average quality crop, suitable for standard market"
        : "Low quality crop, consider alternative use",
    },
  });

  await prisma.cropListing.update({
    where: { id: crop.id },
    data: { qualityGrade: payload.grade, qualityScore: payload.score },
  });

  if (!crop.imageUrl) {
    console.log("Auto-assigning crop image from Unsplash");
    await assignCropImage(crop.id);
  }

  emitSensorUpdate({
    cropId: crop.id,
    temperature: payload.temperature,
    humidity: payload.humidity,
    moisture: payload.moisture,
    qualityScore: payload.score,
    grade: payload.grade,
    timestamp: new Date().toISOString(),
  });
}

async function handleDeviceStatus(deviceCode: string, payload: any): Promise<void> {
  await prisma.device.updateMany({
    where: { deviceCode },
    data: { status: payload.status || "ACTIVE", lastSeen: new Date() },
  });
}

export function publishToDevice(topic: string, payload: object): void {
  if (client && client.connected) {
    client.publish(topic, JSON.stringify(payload), { qos: 1 });
  }
}

export function disconnectMQTT(): void {
  if (client) {
    client.end();
  }
}
