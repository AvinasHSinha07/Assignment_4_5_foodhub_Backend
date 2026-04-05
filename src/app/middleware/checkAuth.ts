import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import AppError from "../errorHelpers/AppError";
import { authenticate } from "../middlewares/authGuard";

export const checkAuth = (...authRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    authenticate(req, res, (error?: unknown) => {
      if (error) {
        next(error);
        return;
      }

      if (!req.user) {
        next(new AppError(401, "Unauthorized access"));
        return;
      }

      if (authRoles.length > 0 && !authRoles.includes(req.user.role)) {
        next(new AppError(403, "Forbidden access"));
        return;
      }

      next();
    });
  };
};
