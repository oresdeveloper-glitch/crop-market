const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const cropImages = {
  "Premium Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
  "Fresh Beans": "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800&q=80",
  "Sun-dried Coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "Cassava Flour": "https://images.unsplash.com/photo-1757281096972-10fd02b0f5ea?w=800&q=80",
  "Sweet Potatoes": "https://images.unsplash.com/photo-1753445657069-ba23263dd733?w=800&q=80",
  "Groundnuts": "https://images.unsplash.com/photo-1766997246116-d008d5354465?w=800&q=80",
  "Honey (Raw)": "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=800&q=80",
  "Bananas (Matoke)": "https://images.unsplash.com/photo-1693940747873-7a38078b6bac?w=800&q=80",
  "Sunflower Seeds": "https://images.unsplash.com/photo-1697445635277-c3b4387e3fed?w=800&q=80",
  "Avocados (Fuerte)": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80",
};

const cropData = [
  { name: "Premium Rice", qty: 500, price: 2800, grade: "A", score: 88 },
  { name: "Fresh Beans", qty: 300, price: 1800, grade: "A", score: 85 },
  { name: "Sun-dried Coffee", qty: 200, price: 8500, grade: "B", score: 72 },
  { name: "Cassava Flour", qty: 400, price: 1500, grade: "A", score: 90 },
  { name: "Sweet Potatoes", qty: 600, price: 1200, grade: "B", score: 74 },
  { name: "Groundnuts", qty: 350, price: 3200, grade: "A", score: 86 },
  { name: "Honey (Raw)", qty: 100, price: 12000, grade: "A", score: 92 },
  { name: "Bananas (Matoke)", qty: 800, price: 800, grade: "B", score: 70 },
  { name: "Sunflower Seeds", qty: 250, price: 2200, grade: "C", score: 58 },
  { name: "Avocados (Fuerte)", qty: 400, price: 3500, grade: "A", score: 88 },
];

async function main() {
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@bity.com" } });
  if (existingAdmin) {
    console.log("Clearing existing data for re-seed...");
    await prisma.qualityAssessment.deleteMany();
    await prisma.sensorData.deleteMany();
    await prisma.order.deleteMany();
    await prisma.device.deleteMany();
    await prisma.cropListing.deleteMany();
    await prisma.farmer.deleteMany();
    await prisma.buyer.deleteMany();
    await prisma.user.deleteMany();
    console.log("Cleared. Re-seeding...");
  }

  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: { fullName: "Admin User", email: "admin@bity.com", passwordHash: adminHash, role: "ADMIN" },
  });
  console.log("Created admin:", admin.id);

  const farmerHash = await bcrypt.hash("farmer123", 12);
  const farmerUser = await prisma.user.create({
    data: { fullName: "Demo Farmer", email: "farmer@bity.com", phone: "+255700000001", passwordHash: farmerHash, role: "FARMER" },
  });
  const farmer = await prisma.farmer.create({
    data: { userId: farmerUser.id, farmLocation: "Mbeya", region: "Southern Highlands", mainCrop: "Mixed", verificationStatus: "VERIFIED" },
  });
  console.log("Created farmer:", farmer.id);

  const buyerHash = await bcrypt.hash("buyer123", 12);
  const buyerUser = await prisma.user.create({
    data: { fullName: "Demo Buyer", email: "buyer@bity.com", phone: "+255700000002", passwordHash: buyerHash, role: "BUYER" },
  });
  const buyer = await prisma.buyer.create({
    data: { userId: buyerUser.id, businessName: "FreshPro Ltd", buyerType: "Wholesaler", location: "Dar es Salaam" },
  });
  console.log("Created buyer:", buyer.id);

  for (const c of cropData) {
    const crop = await prisma.cropListing.create({
      data: {
        farmerId: farmer.id,
        cropName: c.name,
        quantityKg: c.qty,
        pricePerKg: c.price,
        location: farmer.farmLocation,
        imageUrl: cropImages[c.name],
        qualityGrade: c.grade,
        qualityScore: c.score,
        status: "AVAILABLE",
      },
    });

    console.log("Created crop:", c.name);
  }

  console.log("Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
