import { Request } from "express";

export interface AuthPayload {
  userId: string;
  role: "FARMER" | "BUYER" | "ADMIN";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface SensorInput {
  deviceId: string;
  cropId: string;
  temperature: number;
  humidity: number;
  moisture: number;
  colorScore: number;
  gasLevel: number;
  weightKg: number;
}

export interface QualityInput {
  moisture: number;
  colorScore: number;
  sizeScore: number;
  freshnessScore: number;
  imageScore: number;
  storageScore: number;
}

export interface QualityResult {
  finalScore: number;
  grade: string;
}
