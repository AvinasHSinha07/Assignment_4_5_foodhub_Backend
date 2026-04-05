import { UserRole } from "@prisma/client";
import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post("/", checkAuth(UserRole.CUSTOMER), validateRequest(createReviewSchema), ReviewController.createReview);
router.get("/meal/:mealId", ReviewController.getMealReviews);
router.get("/provider/:providerId", ReviewController.getProviderReviews);

export const ReviewRoutes = router;
