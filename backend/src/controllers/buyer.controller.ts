import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
    });
    if (!buyer) {
      res.status(404).json({ error: "Buyer profile not found" });
      return;
    }
    res.json(buyer);
  } catch (error) {
    console.error("Get buyer profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { businessName, buyerType, location, ...userData } = req.body;
    const buyer = await prisma.buyer.update({
      where: { userId: req.user!.userId },
      data: { businessName, buyerType, location },
    });
    if (userData.fullName || userData.phone || userData.email) {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: userData,
      });
    }
    res.json(buyer);
  } catch (error) {
    console.error("Update buyer profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
