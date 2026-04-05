import { UserRole } from "@prisma/client";
import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminController } from "./admin.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "./admin.validation";

const router = Router();

router.get("/stats", checkAuth(UserRole.ADMIN), AdminController.getDashboardStats);
router.get("/users", checkAuth(UserRole.ADMIN), AdminController.getUsers);
router.patch(
  "/users/:userId/role",
  checkAuth(UserRole.ADMIN),
  validateRequest(updateUserRoleSchema),
  AdminController.updateUserRole,
);
router.patch(
  "/users/:userId/status",
  checkAuth(UserRole.ADMIN),
  validateRequest(updateUserStatusSchema),
  AdminController.updateUserStatus,
);
router.get("/orders", checkAuth(UserRole.ADMIN), AdminController.getOrders);
router.get("/providers", checkAuth(UserRole.ADMIN), AdminController.getProviders);
router.patch("/providers/:providerId/deactivate", checkAuth(UserRole.ADMIN), AdminController.deleteProvider);
router.post(
  "/categories",
  checkAuth(UserRole.ADMIN),
  validateRequest(createCategorySchema),
  AdminController.createCategory,
);
router.patch(
  "/categories/:categoryId",
  checkAuth(UserRole.ADMIN),
  validateRequest(updateCategorySchema),
  AdminController.updateCategory,
);
router.delete("/categories/:categoryId", checkAuth(UserRole.ADMIN), AdminController.deleteCategory);

export const AdminRoutes = router;
