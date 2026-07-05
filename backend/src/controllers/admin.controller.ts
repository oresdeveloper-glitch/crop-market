import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";

export async function getOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [farmers, buyers, crops, orders, assessments] = await Promise.all([
      prisma.farmer.count(),
      prisma.buyer.count(),
      prisma.cropListing.count({ where: { status: "AVAILABLE" } }),
      prisma.order.count(),
      prisma.qualityAssessment.count(),
    ]);
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { paymentStatus: "PAID" },
    });
    res.json({
      totalFarmers: farmers,
      totalBuyers: buyers,
      activeListings: crops,
      totalOrders: orders,
      totalAssessments: assessments,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
}

export async function getFarmers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmers = await prisma.farmer.findMany({
      include: { user: { select: { id: true, fullName: true, phone: true, email: true, createdAt: true } } },
      orderBy: { user: { createdAt: "desc" } },
    });
    res.json(farmers);
  } catch (error) {
    console.error("Admin get farmers error:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
}

export async function getBuyers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyers = await prisma.buyer.findMany({
      include: { user: { select: { id: true, fullName: true, phone: true, email: true, createdAt: true } } },
      orderBy: { user: { createdAt: "desc" } },
    });
    res.json(buyers);
  } catch (error) {
    console.error("Admin get buyers error:", error);
    res.status(500).json({ error: "Failed to fetch buyers" });
  }
}

export async function getAllOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        crop: { select: { cropName: true } },
        buyer: { include: { user: { select: { fullName: true } } } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Admin get all orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

export async function getAllCrops(req: AuthRequest, res: Response): Promise<void> {
  try {
    const crops = await prisma.cropListing.findMany({
      orderBy: { createdAt: "desc" },
      include: { farmer: { include: { user: { select: { fullName: true } } } } },
    });
    res.json(crops);
  } catch (error) {
    console.error("Admin get all crops error:", error);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
}

export async function getSensorMonitoring(req: AuthRequest, res: Response): Promise<void> {
  try {
    const devices = await prisma.device.findMany({
      include: { farmer: { include: { user: { select: { fullName: true } } } } },
      orderBy: { lastSeen: "desc" },
    });
    res.json(devices);
  } catch (error) {
    console.error("Admin sensor monitoring error:", error);
    res.status(500).json({ error: "Failed to fetch sensor data" });
  }
}

export async function getReports(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [gradeDistribution, monthlyOrders, topCrops] = await Promise.all([
      prisma.cropListing.groupBy({
        by: ["qualityGrade"],
        _count: true,
      }),
      prisma.order.groupBy({
        by: ["orderStatus"],
        _count: true,
      }),
      prisma.cropListing.groupBy({
        by: ["cropName"],
        _sum: { quantityKg: true },
        orderBy: { _sum: { quantityKg: "desc" } },
        take: 10,
      }),
    ]);
    res.json({ gradeDistribution, monthlyOrders, topCrops });
  } catch (error) {
    console.error("Admin reports error:", error);
    res.status(500).json({ error: "Failed to generate reports" });
  }
}

export async function verifyFarmer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;
    if (!["PENDING", "VERIFIED", "REJECTED"].includes(verificationStatus)) {
      res.status(400).json({ error: "Invalid status. Use PENDING, VERIFIED, or REJECTED" });
      return;
    }
    const farmer = await prisma.farmer.update({
      where: { id },
      data: { verificationStatus },
    });
    res.json(farmer);
  } catch (error) {
    console.error("Verify farmer error:", error);
    res.status(500).json({ error: "Failed to update verification status" });
  }
}
