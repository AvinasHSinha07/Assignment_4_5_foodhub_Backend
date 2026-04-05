import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { HealthRoutes } from "../module/health/health.route";
import { MealRoutes } from "../module/meal/meal.route";
import { ProviderRoutes } from "../module/provider/provider.route";
import { ProtectedRoutes } from "../module/protected/protected.route";

const router = Router();

const moduleRoutes = [
	{ path: "/", route: HealthRoutes },
	{ path: "/auth", route: AuthRoutes },
	{ path: "/meals", route: MealRoutes },
	{ path: "/providers", route: ProviderRoutes },
	{ path: "/protected", route: ProtectedRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const IndexRoutes = router;
export default IndexRoutes;
