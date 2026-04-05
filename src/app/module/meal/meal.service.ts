import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import type { TGetMealsQuery, TGetMealsResult, TMealDetails, TMealSummary } from "./meal.interface";

const mapMealSummary = (meal: {
  id: string;
  title: string;
  description: string;
  price: unknown;
  image: string | null;
  dietaryTag: string | null;
  isAvailable: boolean;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  provider: {
    id: string;
    name: string;
    providerProfile: {
      restaurantName: string;
      cuisineType: string;
    } | null;
  };
}): TMealSummary => ({
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
});

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
    data: meals.map(mapMealSummary),
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

const getMealById = async (mealId: string): Promise<TMealDetails> => {
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
    },
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
              description: true,
              address: true,
            },
          },
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      },
    },
  });

  if (!meal) {
    throw new AppError(404, "Meal not found");
  }

  const ratings = meal.reviews.map((review) => review.rating);
  const averageRating = ratings.length
    ? Number((ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1))
    : 0;

  const summary = mapMealSummary(meal);

  return {
    ...summary,
    provider: {
      ...summary.provider,
      description: meal.provider.providerProfile?.description ?? null,
      address: meal.provider.providerProfile?.address ?? null,
    },
    rating: {
      average: averageRating,
      totalReviews: ratings.length,
    },
    reviews: meal.reviews,
  };
};

const getMealsByProvider = async (providerId: string) => {
  const meals = await prisma.meal.findMany({
    where: {
      providerId,
      isAvailable: true,
    },
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
  });

  return meals.map(mapMealSummary);
};

export const MealService = {
  getAllMeals,
  getMealCategories,
  getMealById,
  getMealsByProvider,
};
