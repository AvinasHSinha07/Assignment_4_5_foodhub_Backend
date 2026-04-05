import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const order = await OrderService.createOrder(req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Order created successfully",
    data: order,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
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

  const result = await OrderService.getMyOrders(req.user.userId, page, limit);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Orders fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyOrderById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const order = await OrderService.getMyOrderById(req.user.userId, orderId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Order fetched successfully",
    data: order,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getMyOrderById,
};
