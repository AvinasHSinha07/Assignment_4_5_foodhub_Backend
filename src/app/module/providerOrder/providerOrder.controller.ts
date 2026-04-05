import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProviderOrderService } from "./providerOrder.service";

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const page = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;

  const result = await ProviderOrderService.getProviderOrders(req.user.userId, page, limit);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider orders fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getProviderOrderById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const order = await ProviderOrderService.getProviderOrderById(req.user.userId, id);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider order fetched successfully",
    data: order,
  });
});

const updateProviderOrderStatus = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const order = await ProviderOrderService.updateProviderOrderStatus(req.user.userId, id, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Order status updated successfully",
    data: order,
  });
});

export const ProviderOrderController = {
  getProviderOrders,
  getProviderOrderById,
  updateProviderOrderStatus,
};
