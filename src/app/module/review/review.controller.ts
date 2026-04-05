import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const review = await ReviewService.createReview(req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Review created successfully",
    data: review,
  });
});

const getMealReviews = catchAsync(async (req: Request, res: Response) => {
  const mealId = Array.isArray(req.params.mealId) ? req.params.mealId[0] : req.params.mealId;
  const reviews = await ReviewService.getMealReviews(mealId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Meal reviews fetched successfully",
    data: reviews,
  });
});

const getProviderReviews = catchAsync(async (req: Request, res: Response) => {
  const providerId = Array.isArray(req.params.providerId) ? req.params.providerId[0] : req.params.providerId;
  const reviews = await ReviewService.getProviderReviews(providerId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider reviews fetched successfully",
    data: reviews,
  });
});

export const ReviewController = {
  createReview,
  getMealReviews,
  getProviderReviews,
};
