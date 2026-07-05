import { Server as HTTPServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

export function initWebSocket(server: HTTPServer): Server {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  io.on("connection", (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);
    socket.on("subscribe-crop", (cropId: string) => {
      socket.join(`crop:${cropId}`);
    });
    socket.on("unsubscribe-crop", (cropId: string) => {
      socket.leave(`crop:${cropId}`);
    });
    socket.on("disconnect", () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });
  return io;
}

export function emitSensorUpdate(data: {
  cropId: string;
  temperature: number;
  humidity: number;
  moisture: number;
  qualityScore?: number;
  grade?: string;
  timestamp: string;
}): void {
  if (io) {
    io.emit("sensor-update", data);
    io.to(`crop:${data.cropId}`).emit("crop-sensor-update", data);
  }
}

export function getIO(): Server | null {
  return io;
}
