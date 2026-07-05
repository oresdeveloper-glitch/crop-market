export interface User {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: "FARMER" | "BUYER" | "ADMIN";
  createdAt?: string;
}

export interface Farmer {
  id: string;
  userId: string;
  farmLocation?: string;
  region?: string;
  mainCrop?: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  user: User;
  devices?: Device[];
  cropListings?: CropListing[];
}

export interface Buyer {
  id: string;
  userId: string;
  businessName?: string;
  buyerType?: string;
  location?: string;
  user: User;
}

export interface Device {
  id: string;
  farmerId: string;
  deviceCode: string;
  deviceType?: string;
  status: string;
  lastSeen?: string;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmer?: { user: { fullName: string; phone?: string } };
  cropName: string;
  quantityKg: number;
  pricePerKg: number;
  location?: string;
  imageUrl?: string;
  description?: string;
  qualityGrade?: string;
  qualityScore?: number;
  status: "AVAILABLE" | "SOLD" | "REMOVED";
  createdAt: string;
  qualityAssessments?: QualityAssessment[];
  sensorData?: SensorData[];
}

export interface SensorData {
  id: string;
  cropId: string;
  deviceId: string;
  temperature?: number;
  humidity?: number;
  moisture?: number;
  colorScore?: number;
  gasLevel?: number;
  weightKg?: number;
  recordedAt: string;
}

export interface QualityAssessment {
  id: string;
  cropId: string;
  moistureScore?: number;
  colorScore?: number;
  sizeScore?: number;
  freshnessScore?: number;
  imageScore?: number;
  storageScore?: number;
  finalScore?: number;
  grade?: string;
  remarks?: string;
  assessedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  cropId: string;
  quantityKg: number;
  totalPrice: number;
  orderStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  deliveryLocation?: string;
  notes?: string;
  createdAt: string;
  crop?: { cropName: string; qualityGrade?: string; farmer?: { user: { fullName: string } } };
  buyer?: { user: { fullName: string; phone?: string } };
}

export interface AdminOverview {
  totalFarmers: number;
  totalBuyers: number;
  activeListings: number;
  totalOrders: number;
  totalAssessments: number;
  totalRevenue: number;
}

export interface ReportData {
  gradeDistribution: { qualityGrade: string | null; _count: number }[];
  monthlyOrders: { orderStatus: string; _count: number }[];
  topCrops: { cropName: string; _sum: { quantityKg: number | null } }[];
}
