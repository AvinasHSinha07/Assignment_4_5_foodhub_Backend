import { Router } from "express";
import { UserRole } from "@prisma/client";
import { checkAuth } from "../middleware/checkAuth";
import { ProtectedController } from "../controllers/protected.controller";

const router = Router();

router.get(
  "/protected/customer",
  checkAuth(UserRole.CUSTOMER),
  ProtectedController.getCustomerOnly,
);
router.get(
  "/protected/provider",
  checkAuth(UserRole.PROVIDER),
  ProtectedController.getProviderOnly,
);
router.get(
  "/protected/admin",
  checkAuth(UserRole.ADMIN),
  ProtectedController.getAdminOnly,
);

export const ProtectedRoutes = router;
export default ProtectedRoutes;
