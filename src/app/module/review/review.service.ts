import { OrderStatus, UserRole } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { TCreateReviewInput } from "./review.validation";

const createReview = async (customerId: string, payload: TCreateReviewInput) => {
  const customer = await prisma.user.findUnique({
    where: {
      id: customerId,
    },
    select: {
      role: true,
    },
  });

  if (!customer || customer.role !== UserRole.CUSTOMER) {
    throw new AppError(403, "Only customers can create reviews");
  }

  const meal = await prisma.meal.findUnique({
    where: {
      id: payload.mealId,
    },
    select: {
      id: true,
      providerId: true,
    },
  });

  if (!meal) {
    throw new AppError(404, "Meal not found");
  }

  const deliveredOrder = await prisma.order.findFirst({
    where: {
      customerId,
      orderStatus: OrderStatus.DELIVERED,
      items: {
        some: {
          mealId: meal.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!deliveredOrder) {
    throw new AppError(403, "You can review only meals from delivered orders");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_mealId: {
        customerId,
        mealId: meal.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingReview) {
    throw new AppError(409, "You have already reviewed this meal");
  }

  return prisma.review.create({
    data: {
      mealId: meal.id,
      customerId,
      rating: payload.rating,
      comment: payload.comment?.trim() || null,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      meal: {
        select: {
          id: true,
          title: true,
          image: true,
        },
      },
    },
  });
};

const getMealReviews = async (mealId: string) => {
  return prisma.review.findMany({
    where: {
      mealId,
    },
    include: {
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
  });
};

const getProviderReviews = async (providerId: string) => {
  return prisma.review.findMany({
    where: {
      meal: {
        providerId,
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      meal: {
        select: {
          id: true,
          title: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const ReviewService = {
  createReview,
  getMealReviews,
  getProviderReviews,
};
