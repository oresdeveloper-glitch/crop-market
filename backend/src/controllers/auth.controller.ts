import { Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";
import { generateToken } from "../middleware/auth";

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fullName, phone, email, password, role } = req.body;

    if (!email && !phone) {
      res.status(400).json({ error: "Email or phone is required" });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email || "" }, { phone: phone || "" }].filter(
          (c) => c.email || c.phone
        ),
      },
    });
    if (existing) {
      res.status(400).json({ error: "Email or phone already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        passwordHash,
        role,
      },
    });

    if (role === "FARMER") {
      await prisma.farmer.create({ data: { userId: user.id } });
    } else if (role === "BUYER") {
      await prisma.buyer.create({ data: { userId: user.id } });
    }

    const token = generateToken({ userId: user.id, role: user.role as "FARMER" | "BUYER" | "ADMIN" });
    res.status(201).json({
      token,
      user: { id: user.id, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, phone, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email || "" }, { phone: phone || "" }].filter(
          (c) => c.email || c.phone
        ),
      },
    });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken({ userId: user.id, role: user.role as "FARMER" | "BUYER" | "ADMIN" });
    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, fullName: true, phone: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}
