import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const router = Router();

router.get("/health", HealthController.getHealth);

export const HealthRoutes = router;
export default HealthRoutes;
