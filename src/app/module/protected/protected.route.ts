import { Router } from "express";
import { UserRole } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { ProtectedController } from "./protected.controller";

const router = Router();

router.get("/customer", checkAuth(UserRole.CUSTOMER), ProtectedController.getCustomerOnly);
router.get("/provider", checkAuth(UserRole.PROVIDER), ProtectedController.getProviderOnly);
router.get("/admin", checkAuth(UserRole.ADMIN), ProtectedController.getAdminOnly);

export const ProtectedRoutes = router;
