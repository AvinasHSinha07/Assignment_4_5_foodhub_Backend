import { Router } from "express";
import { UserRole } from "@prisma/client";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { loginSchema, registerSchema } from "../../validations/auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", checkAuth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN), AuthController.me);

export const AuthRoutes = router;
