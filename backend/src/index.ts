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
import { connectMQTT } from "./services/iot.service";
import { initWebSocket } from "./services/websocket.service";

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initWebSocket(server);
  connectMQTT();
});

export default app;
