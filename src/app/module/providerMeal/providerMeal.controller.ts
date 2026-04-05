import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProviderMealService } from "./providerMeal.service";

const getMyMeals = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const meals = await ProviderMealService.getMyMeals(userId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider meals fetched successfully",
    data: meals,
  });
});

const createMeal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const meal = await ProviderMealService.createMeal(userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Meal created successfully",
    data: meal,
  });
});

const updateMeal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const mealId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!userId) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const meal = await ProviderMealService.updateMeal(userId, mealId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Meal updated successfully",
    data: meal,
  });
});

const deleteMeal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const mealId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!userId) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  await ProviderMealService.deleteMeal(userId, mealId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Meal deleted successfully",
    data: null,
  });
});

export const ProviderMealController = {
  getMyMeals,
  createMeal,
  updateMeal,
  deleteMeal,
};
