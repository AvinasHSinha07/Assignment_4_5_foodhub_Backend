import { UserRole } from "@prisma/client";
import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import {
  confirmOrderPaymentSchema,
  confirmPaymentSchema,
  createOrderPaymentIntentSchema,
  createPaymentIntentSchema,
} from "./payment.validation";

const router = Router();

router.post(
  "/create-intent",
  checkAuth(UserRole.CUSTOMER),
  validateRequest(createPaymentIntentSchema),
  PaymentController.createPaymentIntent,
);

router.post(
  "/confirm",
  checkAuth(UserRole.CUSTOMER),
  validateRequest(confirmPaymentSchema),
  PaymentController.confirmPayment,
);

router.post(
  "/orders/create-intent",
  checkAuth(UserRole.CUSTOMER),
  validateRequest(createOrderPaymentIntentSchema),
  PaymentController.createOrderPaymentIntent,
);

router.post(
  "/orders/confirm",
  checkAuth(UserRole.CUSTOMER),
  validateRequest(confirmOrderPaymentSchema),
  PaymentController.confirmOrderPayment,
);

export const PaymentRoutes = router;
