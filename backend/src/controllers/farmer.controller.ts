import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { id: true, fullName: true, phone: true, email: true } }, devices: true },
    });
    if (!farmer) {
      res.status(404).json({ error: "Farmer profile not found" });
      return;
    }
    res.json(farmer);
  } catch (error) {
    console.error("Get farmer profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { farmLocation, region, mainCrop, verificationStatus, ...userData } = req.body;
    const farmer = await prisma.farmer.update({
      where: { userId: req.user!.userId },
      data: {
        farmLocation,
        region,
        mainCrop,
        ...(verificationStatus && req.user!.role === "ADMIN" ? { verificationStatus } : {}),
      },
    });
    if (userData.fullName || userData.phone || userData.email) {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: userData,
      });
    }
    res.json(farmer);
  } catch (error) {
    console.error("Update farmer profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

export async function getListings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user!.userId } });
    if (!farmer) {
      res.status(404).json({ error: "Farmer not found" });
      return;
    }
    const listings = await prisma.cropListing.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: "desc" },
      include: { qualityAssessments: { orderBy: { assessedAt: "desc" }, take: 1 } },
    });
    res.json(listings);
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user!.userId } });
    if (!farmer) {
      res.status(404).json({ error: "Farmer not found" });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { crop: { farmerId: farmer.id } },
      orderBy: { createdAt: "desc" },
      include: {
        crop: { select: { cropName: true, quantityKg: true, pricePerKg: true } },
        buyer: { include: { user: { select: { fullName: true, phone: true } } } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Get farmer orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

export async function getFarmerById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { fullName: true, phone: true, email: true } },
        cropListings: { where: { status: "AVAILABLE" } },
      },
    });
    if (!farmer) {
      res.status(404).json({ error: "Farmer not found" });
      return;
    }
    res.json(farmer);
  } catch (error) {
    console.error("Get farmer by ID error:", error);
    res.status(500).json({ error: "Failed to fetch farmer" });
  }
}
