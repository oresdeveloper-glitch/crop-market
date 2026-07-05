import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { userId: req.user!.userId } });
    if (!buyer) {
      res.status(404).json({ error: "Buyer profile not found" });
      return;
    }

    const { cropId, quantityKg, deliveryLocation, notes } = req.body;
    const crop = await prisma.cropListing.findUnique({ where: { id: cropId } });
    if (!crop || crop.status !== "AVAILABLE") {
      res.status(404).json({ error: "Crop not available" });
      return;
    }
    if (quantityKg > crop.quantityKg) {
      res.status(400).json({ error: "Requested quantity exceeds available stock" });
      return;
    }

    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        cropId,
        quantityKg,
        totalPrice: quantityKg * crop.pricePerKg,
        deliveryLocation,
        notes,
      },
    });

    await prisma.cropListing.update({
      where: { id: cropId },
      data: { quantityKg: crop.quantityKg - quantityKg },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { userId: req.user!.userId } });
    if (!buyer) {
      res.status(404).json({ error: "Buyer not found" });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { buyerId: buyer.id },
      orderBy: { createdAt: "desc" },
      include: {
        crop: { select: { cropName: true, qualityGrade: true, farmer: { include: { user: { select: { fullName: true } } } } } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        crop: { include: { farmer: { include: { user: { select: { fullName: true, phone: true } } } } } },
        buyer: { include: { user: { select: { fullName: true, phone: true } } } },
      },
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const buyer = await prisma.buyer.findUnique({ where: { userId: req.user!.userId } });
    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user!.userId } });
    if (
      order.buyerId !== buyer?.id &&
      order.crop.farmerId !== farmer?.id &&
      req.user!.role !== "ADMIN"
    ) {
      res.status(403).json({ error: "Not authorized to view this order" });
      return;
    }
    res.json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { crop: true },
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user!.userId } });
    if (order.crop.farmerId !== farmer?.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to update this order" });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
}
