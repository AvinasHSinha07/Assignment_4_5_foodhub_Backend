import type { NextFunction, Request, Response } from "express";
import { UserStatus, type UserRole } from "@prisma/client";
import { getBetterAuthSession } from "../../lib/betterAuth";
import { AppError } from "../utils/AppError";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const session = (await getBetterAuthSession(req.headers)) as {
      user?: {
        id?: string;
        email?: string;
        role?: string;
        status?: string;
      };
    } | null;

    if (!session?.user) {
      throw new AppError(401, "User session not found");
    }

    if (session.user.status === UserStatus.SUSPENDED) {
      throw new AppError(403, "Your account is suspended");
    }

    const role = session.user.role as UserRole | undefined;

    if (!role || !session.user.id || !session.user.email) {
      throw new AppError(401, "Unauthorized access");
    }

    req.user = {
      userId: session.user.id,
      email: session.user.email,
      role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
