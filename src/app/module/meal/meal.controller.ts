import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MealService } from "./meal.service";

const getAllMeals = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await MealService.getAllMeals({
    searchTerm: typeof query.searchTerm === "string" ? query.searchTerm.trim() : undefined,
    category: typeof query.category === "string" ? query.category.trim() : undefined,
    dietaryTag: typeof query.dietaryTag === "string" ? query.dietaryTag.trim() : undefined,
    minPrice: typeof query.minPrice === "string" ? Number(query.minPrice) : undefined,
    maxPrice: typeof query.maxPrice === "string" ? Number(query.maxPrice) : undefined,
    providerId: typeof query.providerId === "string" ? query.providerId.trim() : undefined,
    page: typeof query.page === "string" ? Number(query.page) : undefined,
    limit: typeof query.limit === "string" ? Number(query.limit) : undefined,
  });

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Meals fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMealCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await MealService.getMealCategories();

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Meal categories fetched successfully",
    data: categories,
  });
});

export const MealController = {
  getAllMeals,
  getMealCategories,
};
