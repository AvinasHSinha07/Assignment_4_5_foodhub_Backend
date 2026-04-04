import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
  statement_timeout: 30000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDatabase(retries = 5) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      return;
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw lastError;
      }

      const waitMs = attempt * 2000;
      console.warn(`Database warmup attempt ${attempt} failed. Retrying in ${waitMs / 1000}s...`);
      await sleep(waitMs);
    }
  }
}

async function runWithRetry(retries = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await main();
      return;
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw lastError;
      }

      const waitMs = attempt * 3000;
      console.warn(
        `Seed attempt ${attempt} failed. Retrying in ${waitMs / 1000}s...`,
      );
      await sleep(waitMs);
    }
  }
}

async function main() {
  await waitForDatabase();

  const passwordHash = await bcrypt.hash("admin123", 10);
  const providerPasswordHash = await bcrypt.hash("provider123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@foodhub.com" },
    update: {
      name: "FoodHub Admin",
      role: UserRole.ADMIN,
      password: passwordHash,
    },
    create: {
      name: "FoodHub Admin",
      email: "admin@foodhub.com",
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const providerOne = await prisma.user.upsert({
    where: { email: "provider1@foodhub.com" },
    update: {
      name: "Green Bowl Kitchen",
      role: UserRole.PROVIDER,
      password: providerPasswordHash,
    },
    create: {
      name: "Green Bowl Kitchen",
      email: "provider1@foodhub.com",
      password: providerPasswordHash,
      role: UserRole.PROVIDER,
    },
  });

  const providerTwo = await prisma.user.upsert({
    where: { email: "provider2@foodhub.com" },
    update: {
      name: "Spice Route House",
      role: UserRole.PROVIDER,
      password: providerPasswordHash,
    },
    create: {
      name: "Spice Route House",
      email: "provider2@foodhub.com",
      password: providerPasswordHash,
      role: UserRole.PROVIDER,
    },
  });

  const customerOne = await prisma.user.upsert({
    where: { email: "customer1@foodhub.com" },
    update: {
      name: "Sample Customer",
      role: UserRole.CUSTOMER,
      password: customerPasswordHash,
    },
    create: {
      name: "Sample Customer",
      email: "customer1@foodhub.com",
      password: customerPasswordHash,
      role: UserRole.CUSTOMER,
    },
  });

  await prisma.providerProfile.upsert({
    where: { userId: providerOne.id },
    update: {
      restaurantName: "Green Bowl Kitchen",
      address: "12 Lake Road, Dhaka",
      cuisineType: "Healthy",
      description: "Fresh bowls, salads, and healthy meals",
    },
    create: {
      userId: providerOne.id,
      restaurantName: "Green Bowl Kitchen",
      address: "12 Lake Road, Dhaka",
      cuisineType: "Healthy",
      description: "Fresh bowls, salads, and healthy meals",
    },
  });

  await prisma.providerProfile.upsert({
    where: { userId: providerTwo.id },
    update: {
      restaurantName: "Spice Route House",
      address: "44 Central Avenue, Dhaka",
      cuisineType: "Asian",
      description: "Spicy and flavorful Asian fusion dishes",
    },
    create: {
      userId: providerTwo.id,
      restaurantName: "Spice Route House",
      address: "44 Central Avenue, Dhaka",
      cuisineType: "Asian",
      description: "Spicy and flavorful Asian fusion dishes",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "healthy" },
      update: { name: "Healthy" },
      create: { name: "Healthy", slug: "healthy" },
    }),
    prisma.category.upsert({
      where: { slug: "asian" },
      update: { name: "Asian" },
      create: { name: "Asian", slug: "asian" },
    }),
    prisma.category.upsert({
      where: { slug: "desserts" },
      update: { name: "Desserts" },
      create: { name: "Desserts", slug: "desserts" },
    }),
    prisma.category.upsert({
      where: { slug: "beverages" },
      update: { name: "Beverages" },
      create: { name: "Beverages", slug: "beverages" },
    }),
  ]);

  const [healthyCategory, asianCategory, dessertsCategory, beveragesCategory] = categories;

  const mealsSeed = [
    {
      providerId: providerOne.id,
      categoryId: healthyCategory.id,
      title: "Protein Power Bowl",
      description: "Grilled chicken, quinoa, avocado, greens, and house dressing",
      price: 12.5,
      dietaryTag: "HIGH_PROTEIN",
    },
    {
      providerId: providerOne.id,
      categoryId: healthyCategory.id,
      title: "Vegan Glow Salad",
      description: "Kale, chickpeas, roasted pumpkin, cherry tomatoes, and tahini",
      price: 10.99,
      dietaryTag: "VEGAN",
    },
    {
      providerId: providerTwo.id,
      categoryId: asianCategory.id,
      title: "Spicy Chicken Ramen",
      description: "Noodles, marinated chicken, egg, nori, and spicy broth",
      price: 13.75,
      dietaryTag: null,
    },
    {
      providerId: providerTwo.id,
      categoryId: dessertsCategory.id,
      title: "Mango Sticky Rice",
      description: "Coconut sticky rice with ripe mango and sesame",
      price: 7.25,
      dietaryTag: "VEGETARIAN",
    },
    {
      providerId: providerTwo.id,
      categoryId: beveragesCategory.id,
      title: "Lemon Mint Cooler",
      description: "Fresh lemon juice, mint, and soda",
      price: 4.5,
      dietaryTag: "VEGAN",
    },
  ];

  for (const meal of mealsSeed) {
    await prisma.meal.upsert({
      where: {
        providerId_title: {
          providerId: meal.providerId,
          title: meal.title,
        },
      },
      update: {
        description: meal.description,
        price: meal.price,
        categoryId: meal.categoryId,
        dietaryTag: meal.dietaryTag,
        isAvailable: true,
      },
      create: {
        providerId: meal.providerId,
        categoryId: meal.categoryId,
        title: meal.title,
        description: meal.description,
        price: meal.price,
        dietaryTag: meal.dietaryTag,
        isAvailable: true,
      },
    });
  }

  console.log("Seed completed successfully");
  console.log(`Admin: ${admin.email} / admin123`);
  console.log(`Sample provider: ${providerOne.email} / provider123`);
  console.log(`Sample customer: ${customerOne.email} / customer123`);
}

runWithRetry()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
