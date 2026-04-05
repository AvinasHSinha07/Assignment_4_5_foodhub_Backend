import { UserRole } from "@prisma/client";
import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { confirmPaymentSchema, createPaymentIntentSchema } from "./payment.validation";

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

export const PaymentRoutes = router;
