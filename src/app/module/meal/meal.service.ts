import { prisma } from "../../../lib/prisma";
import type { TGetMealsQuery, TGetMealsResult } from "./meal.interface";

const getAllMeals = async (query: TGetMealsQuery): Promise<TGetMealsResult> => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 20) : 12;
  const skip = (page - 1) * limit;

  const whereClause = {
    isAvailable: true,
    ...(query.searchTerm
      ? {
          OR: [
            { title: { contains: query.searchTerm, mode: "insensitive" as const } },
            { description: { contains: query.searchTerm, mode: "insensitive" as const } },
            { provider: { name: { contains: query.searchTerm, mode: "insensitive" as const } } },
            {
              provider: {
                providerProfile: {
                  restaurantName: { contains: query.searchTerm, mode: "insensitive" as const },
                },
              },
            },
          ],
        }
      : {}),
    ...(query.category
      ? {
          category: {
            OR: [
              { slug: { equals: query.category.toLowerCase() } },
              { name: { equals: query.category, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
    ...(query.dietaryTag
      ? { dietaryTag: { equals: query.dietaryTag.toUpperCase() } }
      : {}),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? {
          price: {
            ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
            ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
          },
        }
      : {}),
    ...(query.providerId ? { providerId: query.providerId } : {}),
  };

  const [total, meals] = await Promise.all([
    prisma.meal.count({ where: whereClause }),
    prisma.meal.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            providerProfile: {
              select: {
                restaurantName: true,
                cuisineType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
  ]);

  return {
    data: meals.map((meal) => ({
      id: meal.id,
      title: meal.title,
      description: meal.description,
      price: Number(meal.price),
      image: meal.image,
      dietaryTag: meal.dietaryTag,
      isAvailable: meal.isAvailable,
      createdAt: meal.createdAt,
      category: meal.category,
      provider: {
        id: meal.provider.id,
        name: meal.provider.name,
        restaurantName: meal.provider.providerProfile?.restaurantName ?? null,
        cuisineType: meal.provider.providerProfile?.cuisineType ?? null,
      },
    })),
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getMealCategories = async () => {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const MealService = {
  getAllMeals,
  getMealCategories,
};
