import { UserRole } from "@prisma/client";
import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ProviderProfileController } from "./providerProfile.controller";
import { upsertProviderProfileSchema } from "./providerProfile.validation";

const router = Router();

router.get("/", checkAuth(UserRole.PROVIDER), ProviderProfileController.getMyProviderProfile);
router.put(
  "/",
  checkAuth(UserRole.PROVIDER),
  validateRequest(upsertProviderProfileSchema),
  ProviderProfileController.upsertMyProviderProfile,
);

export const ProviderProfileRoutes = router;
