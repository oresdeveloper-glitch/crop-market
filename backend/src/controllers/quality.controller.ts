import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";
import { assessCropQuality } from "../utils/quality";

export async function assessQuality(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cropId, moistureScore, colorScore, sizeScore, freshnessScore, imageScore, storageScore } = req.body;

    const crop = await prisma.cropListing.findUnique({ where: { id: cropId } });
    if (!crop) {
      res.status(404).json({ error: "Crop not found" });
      return;
    }

    const result = assessCropQuality({
      moistureScore,
      colorScore,
      sizeScore,
      freshnessScore,
      imageScore,
      storageScore,
    });

    const assessment = await prisma.qualityAssessment.create({
      data: {
        cropId,
        moistureScore,
        colorScore,
        sizeScore,
        freshnessScore,
        imageScore,
        storageScore,
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
      where: { id: cropId },
      data: { qualityGrade: result.grade, qualityScore: result.finalScore },
    });

    res.status(201).json({ ...assessment, recommendation: assessment.remarks });
  } catch (error) {
    console.error("Assess quality error:", error);
    res.status(500).json({ error: "Failed to assess quality" });
  }
}

export async function getQuality(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assessments = await prisma.qualityAssessment.findMany({
      where: { cropId: req.params.cropId },
      orderBy: { assessedAt: "desc" },
      take: 10,
    });
    res.json(assessments);
  } catch (error) {
    console.error("Get quality error:", error);
    res.status(500).json({ error: "Failed to fetch quality assessments" });
  }
}

export async function getLatestQuality(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assessment = await prisma.qualityAssessment.findFirst({
      where: { cropId: req.params.cropId },
      orderBy: { assessedAt: "desc" },
    });
    if (!assessment) {
      res.status(404).json({ error: "No quality assessment found" });
      return;
    }
    res.json(assessment);
  } catch (error) {
    console.error("Get latest quality error:", error);
    res.status(500).json({ error: "Failed to fetch latest assessment" });
  }
}
