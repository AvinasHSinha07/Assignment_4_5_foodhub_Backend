import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminService } from "./admin.service";

const getUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await AdminService.getUsers();

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Users fetched successfully",
    data: users,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const user = await AdminService.updateUserRole(userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "User role updated successfully",
    data: user,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const user = await AdminService.updateUserStatus(userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "User status updated successfully",
    data: user,
  });
});

const getOrders = catchAsync(async (_req: Request, res: Response) => {
  const orders = await AdminService.getOrders();

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Orders fetched successfully",
    data: orders,
  });
});

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await AdminService.getDashboardStats();

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Dashboard stats fetched successfully",
    data: stats,
  });
});

const deleteProvider = catchAsync(async (req: Request, res: Response) => {
  const providerId = Array.isArray(req.params.providerId) ? req.params.providerId[0] : req.params.providerId;
  const deleted = await AdminService.deleteProvider(providerId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider deactivated successfully",
    data: deleted,
  });
});

const getProviders = catchAsync(async (_req: Request, res: Response) => {
  const providers = await AdminService.getProviders();

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Providers fetched successfully",
    data: providers,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await AdminService.createCategory(req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Category created successfully",
    data: category,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = Array.isArray(req.params.categoryId) ? req.params.categoryId[0] : req.params.categoryId;
  const category = await AdminService.updateCategory(categoryId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = Array.isArray(req.params.categoryId) ? req.params.categoryId[0] : req.params.categoryId;
  const deleted = await AdminService.deleteCategory(categoryId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Category deleted successfully",
    data: deleted,
  });
});

export const AdminController = {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getOrders,
  getDashboardStats,
  deleteProvider,
  getProviders,
  createCategory,
  updateCategory,
  deleteCategory,
};
