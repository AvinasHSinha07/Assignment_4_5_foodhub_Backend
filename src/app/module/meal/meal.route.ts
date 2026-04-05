import { Router } from "express";
import { MealController } from "./meal.controller";

const router = Router();

router.get("/", MealController.getAllMeals);
router.get("/categories", MealController.getMealCategories);

export const MealRoutes = router;
