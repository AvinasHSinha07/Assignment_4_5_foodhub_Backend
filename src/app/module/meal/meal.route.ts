import { Router } from "express";
import { MealController } from "./meal.controller";

const router = Router();

router.get("/", MealController.getAllMeals);
router.get("/categories", MealController.getMealCategories);
router.get("/provider/:providerId", MealController.getMealsByProvider);
router.get("/:id", MealController.getMealById);

export const MealRoutes = router;
