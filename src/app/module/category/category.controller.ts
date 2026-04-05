import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./category.service";

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await CategoryService.getAllCategories();

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Categories fetched successfully",
    data: categories,
  });
});

const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const category = await CategoryService.getCategoryBySlug(slug);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Category details fetched successfully",
    data: category,
  });
});

export const CategoryController = {
  getAllCategories,
  getCategoryBySlug,
};
