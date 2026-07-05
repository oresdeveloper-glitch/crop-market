import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";

export async function createCrop(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user!.userId } });
    if (!farmer) {
      res.status(404).json({ error: "Farmer profile not found" });
      return;
    }
    const crop = await prisma.cropListing.create({
      data: { ...req.body, farmerId: farmer.id },
    });
    res.status(201).json(crop);
  } catch (error) {
    console.error("Create crop error:", error);
    res.status(500).json({ error: "Failed to create crop listing" });
  }
}

export async function getAllCrops(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cropName, location, minPrice, maxPrice, qualityGrade, status } = req.query;
    const where: any = {};
    if (cropName) where.cropName = { contains: cropName as string, mode: "insensitive" };
    if (location) where.location = { contains: location as string, mode: "insensitive" };
    if (minPrice) where.pricePerKg = { ...(where.pricePerKg || {}), gte: parseFloat(minPrice as string) };
    if (maxPrice) where.pricePerKg = { ...(where.pricePerKg || {}), lte: parseFloat(maxPrice as string) };
    if (qualityGrade) where.qualityGrade = qualityGrade;
    where.status = status || "AVAILABLE";

    const crops = await prisma.cropListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        farmer: { include: { user: { select: { fullName: true } } } },
        qualityAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
      },
    });
    res.json(crops);
  } catch (error) {
    console.error("Get all crops error:", error);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
}

export async function getCropById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const crop = await prisma.cropListing.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: { include: { user: { select: { fullName: true, phone: true } } } },
        qualityAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
        sensorData: { orderBy: { recordedAt: "desc" }, take: 10 },
      },
    });
    if (!crop) {
      res.status(404).json({ error: "Crop not found" });
      return;
    }
    res.json(crop);
  } catch (error) {
    console.error("Get crop by ID error:", error);
    res.status(500).json({ error: "Failed to fetch crop" });
  }
}

export async function updateCrop(req: AuthRequest, res: Response): Promise<void> {
  try {
    const crop = await prisma.cropListing.findUnique({ where: { id: req.params.id } });
    if (!crop) {
      res.status(404).json({ error: "Crop not found" });
      return;
    }
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user!.userId } });
    if (crop.farmerId !== farmer?.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to update this listing" });
      return;
    }
    const updated = await prisma.cropListing.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error("Update crop error:", error);
    res.status(500).json({ error: "Failed to update crop" });
  }
}

export async function deleteCrop(req: AuthRequest, res: Response): Promise<void> {
  try {
    const crop = await prisma.cropListing.findUnique({ where: { id: req.params.id } });
    if (!crop) {
      res.status(404).json({ error: "Crop not found" });
      return;
    }
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user!.userId } });
    if (crop.farmerId !== farmer?.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to delete this listing" });
      return;
    }
    await prisma.cropListing.update({
      where: { id: req.params.id },
      data: { status: "REMOVED" },
    });
    res.json({ message: "Crop listing removed" });
  } catch (error) {
    console.error("Delete crop error:", error);
    res.status(500).json({ error: "Failed to delete crop" });
  }
}
