import type { NextFunction, Request, Response } from "express";
import { UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../utils/AppError";
import { authCookieName, verifyAuthToken } from "../utils/auth";

const getTokenFromRequest = (req: Request) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;

  return bearerToken ?? req.cookies?.[authCookieName];
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new AppError(401, "Unauthorized access");
    }

    const decoded = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new AppError(401, "User session not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(403, "Your account is suspended");
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
