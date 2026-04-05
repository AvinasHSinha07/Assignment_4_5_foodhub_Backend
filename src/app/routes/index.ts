import { Router } from "express";
import { AdminRoutes } from "../module/admin/admin.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { CategoryRoutes } from "../module/category/category.route";
import { HealthRoutes } from "../module/health/health.route";
import { MealRoutes } from "../module/meal/meal.route";
import { OrderRoutes } from "../module/order/order.route";
import { PaymentRoutes } from "../module/payment/payment.route";
import { ProfileRoutes } from "../module/profile/profile.route";
import { ProviderMealRoutes } from "../module/providerMeal/providerMeal.route";
import { ProviderOrderRoutes } from "../module/providerOrder/providerOrder.route";
import { ProviderProfileRoutes } from "../module/providerProfile/providerProfile.route";
import { ProviderRoutes } from "../module/provider/provider.route";
import { ProtectedRoutes } from "../module/protected/protected.route";
import { ReviewRoutes } from "../module/review/review.route";
import { UploadRoutes } from "../module/upload/upload.route";

const router = Router();

const moduleRoutes = [
	{ path: "/", route: HealthRoutes },
	{ path: "/admin", route: AdminRoutes },
	{ path: "/auth", route: AuthRoutes },
	{ path: "/categories", route: CategoryRoutes },
	{ path: "/meals", route: MealRoutes },
	{ path: "/orders", route: OrderRoutes },
	{ path: "/payments", route: PaymentRoutes },
	{ path: "/profile", route: ProfileRoutes },
	{ path: "/provider/meals", route: ProviderMealRoutes },
	{ path: "/provider/orders", route: ProviderOrderRoutes },
	{ path: "/provider/profile", route: ProviderProfileRoutes },
	{ path: "/providers", route: ProviderRoutes },
	{ path: "/upload", route: UploadRoutes },
	{ path: "/reviews", route: ReviewRoutes },
	{ path: "/protected", route: ProtectedRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const IndexRoutes = router;
export default IndexRoutes;
