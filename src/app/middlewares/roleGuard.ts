import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import type { UserRole } from "@prisma/client";

export const allowRoles = (roles: UserRole[]) => (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new AppError(401, "Unauthorized access"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, "Forbidden access"));
  }

  return next();
};
