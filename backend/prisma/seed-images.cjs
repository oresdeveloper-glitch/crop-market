const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const cropImages = {
  "Organic Maize":     "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  "Premium Rice":      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
  "Fresh Beans":       "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800&q=80",
  "Sun-dried Coffee":  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "Cassava Flour":     "https://images.unsplash.com/photo-1757281096972-10fd02b0f5ea?w=800&q=80",
  "Sweet Potatoes":    "https://images.unsplash.com/photo-1753445657069-ba23263dd733?w=800&q=80",
  "Groundnuts":        "https://images.unsplash.com/photo-1766997246116-d008d5354465?w=800&q=80",
  "Honey (Raw)":       "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=800&q=80",
  "Bananas (Matoke)":  "https://images.unsplash.com/photo-1693940747873-7a38078b6bac?w=800&q=80",
  "Sunflower Seeds":   "https://images.unsplash.com/photo-1697445635277-c3b4387e3fed?w=800&q=80",
  "Millet Grain":      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "Avocados (Fuerte)": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80",
};

async function main() {
  let updated = 0;
  for (const [name, url] of Object.entries(cropImages)) {
    const crop = await prisma.cropListing.findFirst({ where: { cropName: name } });
    if (crop) {
      await prisma.cropListing.update({ where: { id: crop.id }, data: { imageUrl: url } });
      updated++;
    }
  }
  console.log(`Updated ${updated} crops with images.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
