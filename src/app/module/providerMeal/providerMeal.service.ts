import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import type {
  TCreateProviderMealInput,
  TUpdateProviderMealInput,
} from "./providerMeal.validation";

const ensureCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }
};

const ensureMealOwnership = async (providerId: string, mealId: string) => {
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
    },
    select: {
      id: true,
      providerId: true,
    },
  });

  if (!meal || meal.providerId !== providerId) {
    throw new AppError(404, "Meal not found for this provider");
  }
};

const getMyMeals = async (providerId: string) => {
  const meals = await prisma.meal.findMany({
    where: {
      providerId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return meals.map((meal) => ({
    id: meal.id,
    title: meal.title,
    description: meal.description,
    price: Number(meal.price),
    image: meal.image,
    dietaryTag: meal.dietaryTag,
    isAvailable: meal.isAvailable,
    category: meal.category,
    createdAt: meal.createdAt,
    updatedAt: meal.updatedAt,
  }));
};

const createMeal = async (providerId: string, payload: TCreateProviderMealInput) => {
  await ensureCategoryExists(payload.categoryId);

  const meal = await prisma.meal.create({
    data: {
      providerId,
      categoryId: payload.categoryId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: payload.price,
      image: payload.image ?? null,
      dietaryTag: payload.dietaryTag?.trim() || null,
      isAvailable: payload.isAvailable ?? true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    id: meal.id,
    title: meal.title,
    description: meal.description,
    price: Number(meal.price),
    image: meal.image,
    dietaryTag: meal.dietaryTag,
    isAvailable: meal.isAvailable,
    category: meal.category,
  };
};

const updateMeal = async (
  providerId: string,
  mealId: string,
  payload: TUpdateProviderMealInput,
) => {
  await ensureMealOwnership(providerId, mealId);

  if (payload.categoryId) {
    await ensureCategoryExists(payload.categoryId);
  }

  const meal = await prisma.meal.update({
    where: {
      id: mealId,
    },
    data: {
      ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
      ...(payload.description !== undefined ? { description: payload.description.trim() } : {}),
      ...(payload.price !== undefined ? { price: payload.price } : {}),
      ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
      ...(payload.image !== undefined ? { image: payload.image } : {}),
      ...(payload.dietaryTag !== undefined ? { dietaryTag: payload.dietaryTag.trim() } : {}),
      ...(payload.isAvailable !== undefined ? { isAvailable: payload.isAvailable } : {}),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    id: meal.id,
    title: meal.title,
    description: meal.description,
    price: Number(meal.price),
    image: meal.image,
    dietaryTag: meal.dietaryTag,
    isAvailable: meal.isAvailable,
    category: meal.category,
    updatedAt: meal.updatedAt,
  };
};

const deleteMeal = async (providerId: string, mealId: string) => {
  await ensureMealOwnership(providerId, mealId);

  await prisma.meal.delete({
    where: {
      id: mealId,
    },
  });

  return null;
};

export const ProviderMealService = {
  getMyMeals,
  createMeal,
  updateMeal,
  deleteMeal,
};
