import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(5).max(30).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
  role: z.enum(["FARMER", "BUYER"]),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
});

export const cropListingSchema = z.object({
  cropName: z.string().min(1).max(100),
  quantityKg: z.number().positive(),
  pricePerKg: z.number().positive(),
  location: z.string().max(150).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
});

export const sensorDataSchema = z.object({
  deviceId: z.string().uuid(),
  cropId: z.string().uuid(),
  temperature: z.number().min(-50).max(100),
  humidity: z.number().min(0).max(100),
  moisture: z.number().min(0).max(100),
  colorScore: z.number().min(0).max(100),
  gasLevel: z.number().min(0),
  weightKg: z.number().min(0),
});

export const qualityAssessSchema = z.object({
  moistureScore: z.number().min(0).max(100),
  colorScore: z.number().min(0).max(100),
  sizeScore: z.number().min(0).max(100),
  freshnessScore: z.number().min(0).max(100),
  imageScore: z.number().min(0).max(100),
  storageScore: z.number().min(0).max(100),
});

export const orderSchema = z.object({
  cropId: z.string().min(1),
  quantityKg: z.number().positive(),
  deliveryLocation: z.string().max(150).optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(5).max(30).optional(),
  email: z.string().email().optional(),
  farmLocation: z.string().max(150).optional(),
  region: z.string().max(100).optional(),
  mainCrop: z.string().max(100).optional(),
  businessName: z.string().max(150).optional(),
  buyerType: z.string().max(50).optional(),
  location: z.string().max(150).optional(),
});
