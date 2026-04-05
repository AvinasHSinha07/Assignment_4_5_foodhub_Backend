import { UserRole } from "@prisma/client";
import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ProviderOrderController } from "./providerOrder.controller";
import { updateProviderOrderStatusSchema } from "./providerOrder.validation";

const router = Router();

router.get("/", checkAuth(UserRole.PROVIDER), ProviderOrderController.getProviderOrders);
router.get("/:id", checkAuth(UserRole.PROVIDER), ProviderOrderController.getProviderOrderById);
router.patch(
  "/:id",
  checkAuth(UserRole.PROVIDER),
  validateRequest(updateProviderOrderStatusSchema),
  ProviderOrderController.updateProviderOrderStatus,
);

export const ProviderOrderRoutes = router;
