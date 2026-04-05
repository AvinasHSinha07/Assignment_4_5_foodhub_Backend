import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../../lib/prisma";
import type { TCategoryWithMeals } from "./category.interface";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          meals: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    mealCount: category._count.meals,
  }));
};

const getCategoryBySlug = async (slug: string): Promise<TCategoryWithMeals> => {
  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          meals: true,
        },
      },
      meals: {
        where: {
          isAvailable: true,
        },
        select: {
          id: true,
          title: true,
          price: true,
          image: true,
          provider: {
            select: {
              id: true,
              name: true,
              providerProfile: {
                select: {
                  restaurantName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
      },
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    mealCount: category._count.meals,
    meals: category.meals.map((meal) => ({
      id: meal.id,
      title: meal.title,
      price: Number(meal.price),
      image: meal.image,
      provider: {
        id: meal.provider.id,
        name: meal.provider.name,
        restaurantName: meal.provider.providerProfile?.restaurantName ?? null,
      },
    })),
  };
};

export const CategoryService = {
  getAllCategories,
  getCategoryBySlug,
};
