import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const paymentIntent = await PaymentService.createPaymentIntent(req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Payment intent created successfully",
    data: paymentIntent,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const order = await PaymentService.confirmPayment(req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Payment confirmed and order created successfully",
    data: order,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signatureHeader = req.headers["stripe-signature"];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;

  if (!signature) {
    throw new AppError(400, "Missing Stripe signature header");
  }

  if (!Buffer.isBuffer(req.body)) {
    throw new AppError(400, "Invalid webhook payload");
  }

  const webhookResult = await PaymentService.handleStripeWebhook(req.body, signature);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Stripe webhook received",
    data: webhookResult,
  });
});

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
};
