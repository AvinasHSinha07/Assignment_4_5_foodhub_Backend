import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { CategoryRoutes } from "../module/category/category.route";
import { HealthRoutes } from "../module/health/health.route";
import { MealRoutes } from "../module/meal/meal.route";
import { OrderRoutes } from "../module/order/order.route";
import { PaymentRoutes } from "../module/payment/payment.route";
import { ProviderMealRoutes } from "../module/providerMeal/providerMeal.route";
import { ProviderRoutes } from "../module/provider/provider.route";
import { ProtectedRoutes } from "../module/protected/protected.route";
import { UploadRoutes } from "../module/upload/upload.route";

const router = Router();

const moduleRoutes = [
	{ path: "/", route: HealthRoutes },
	{ path: "/auth", route: AuthRoutes },
	{ path: "/categories", route: CategoryRoutes },
	{ path: "/meals", route: MealRoutes },
	{ path: "/orders", route: OrderRoutes },
	{ path: "/payments", route: PaymentRoutes },
	{ path: "/provider/meals", route: ProviderMealRoutes },
	{ path: "/providers", route: ProviderRoutes },
	{ path: "/upload", route: UploadRoutes },
	{ path: "/protected", route: ProtectedRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const IndexRoutes = router;
export default IndexRoutes;
