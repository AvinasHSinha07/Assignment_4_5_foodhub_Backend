import { UserRole } from "@prisma/client";
import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { OrderController } from "./order.controller";
import { createOrderSchema } from "./order.validation";

const router = Router();

router.post("/", checkAuth(UserRole.CUSTOMER), validateRequest(createOrderSchema), OrderController.createOrder);
router.get("/", checkAuth(UserRole.CUSTOMER), OrderController.getMyOrders);
router.get("/:id", checkAuth(UserRole.CUSTOMER), OrderController.getMyOrderById);

export const OrderRoutes = router;
