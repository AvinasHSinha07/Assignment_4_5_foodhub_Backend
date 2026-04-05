import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import type { UserRole } from "@prisma/client";
import type { SignOptions } from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

const cookieName = "foodhub_token";

const parseJwtExpiresInToMs = (expiresIn: string) => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * unitToMs[unit];
};

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: parseJwtExpiresInToMs(env.JWT_EXPIRES_IN),
  path: "/",
});

export const authCookieName = cookieName;
