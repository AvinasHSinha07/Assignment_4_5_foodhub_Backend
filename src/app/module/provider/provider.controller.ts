import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProviderService } from "./provider.service";

const getAllProviders = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await ProviderService.getAllProviders({
    searchTerm: typeof query.searchTerm === "string" ? query.searchTerm.trim() : undefined,
    cuisineType: typeof query.cuisineType === "string" ? query.cuisineType.trim() : undefined,
    page: typeof query.page === "string" ? Number(query.page) : undefined,
    limit: typeof query.limit === "string" ? Number(query.limit) : undefined,
  });

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Providers fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCuisineTypes = catchAsync(async (_req: Request, res: Response) => {
  const cuisineTypes = await ProviderService.getCuisineTypes();

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Cuisine types fetched successfully",
    data: cuisineTypes,
  });
});

export const ProviderController = {
  getAllProviders,
  getCuisineTypes,
};
