import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ProfileController } from "./profile.controller";
import { updateProfileSchema } from "./profile.validation";

const router = Router();

router.get("/me", checkAuth(), ProfileController.getMyProfile);
router.patch("/me", checkAuth(), validateRequest(updateProfileSchema), ProfileController.updateMyProfile);

export const ProfileRoutes = router;
