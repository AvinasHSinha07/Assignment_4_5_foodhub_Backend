import { Router } from "express";
import { ProviderController } from "./provider.controller";

const router = Router();

router.get("/", ProviderController.getAllProviders);
router.get("/cuisines", ProviderController.getCuisineTypes);
router.get("/:id", ProviderController.getProviderById);

export const ProviderRoutes = router;
