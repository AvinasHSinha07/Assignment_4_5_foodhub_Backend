import { Router } from "express";
import { checkAuth } from "../middleware/checkAuth";
import { validateRequest } from "../middleware/validateRequest";
import { AuthController } from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/auth/register", validateRequest(registerSchema), AuthController.register);
router.post("/auth/login", validateRequest(loginSchema), AuthController.login);
router.post("/auth/logout", AuthController.logout);
router.get(
	"/auth/me",
	checkAuth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
	AuthController.me,
);

export const AuthRoutes = router;
export default AuthRoutes;
