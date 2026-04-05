import { Router } from "express";
import { UserRole } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ProviderMealController } from "./providerMeal.controller";
import {
  createProviderMealSchema,
  updateProviderMealSchema,
} from "./providerMeal.validation";

const router = Router();

router.get("/", checkAuth(UserRole.PROVIDER), ProviderMealController.getMyMeals);
router.post(
  "/",
  checkAuth(UserRole.PROVIDER),
  validateRequest(createProviderMealSchema),
  ProviderMealController.createMeal,
);
router.patch(
  "/:id",
  checkAuth(UserRole.PROVIDER),
  validateRequest(updateProviderMealSchema),
  ProviderMealController.updateMeal,
);
router.delete("/:id", checkAuth(UserRole.PROVIDER), ProviderMealController.deleteMeal);

export const ProviderMealRoutes = router;
