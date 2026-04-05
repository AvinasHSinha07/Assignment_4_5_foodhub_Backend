import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import type { UserRole } from "@prisma/client";
import type { SignOptions } from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

type TAuthTokenType = "access" | "refresh";

type TSignedAuthTokenPayload = AuthTokenPayload & {
  tokenType: TAuthTokenType;
};

const accessCookieNameValue = "foodhub_access_token";
const refreshCookieNameValue = "foodhub_refresh_token";
const legacyCookieName = "foodhub_token";

const parseJwtExpiresInToMs = (expiresIn: string) => {
  const match = expiresIn.match(/^(\d+)([smhdw])$/);

  if (!match) {
    return 15 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return value * unitToMs[unit];
};

const signToken = (
  payload: AuthTokenPayload,
  tokenType: TAuthTokenType,
  secret: string,
  expiresIn: string,
) =>
  jwt.sign(
    {
      ...payload,
      tokenType,
    },
    secret,
    {
      expiresIn: expiresIn as SignOptions["expiresIn"],
    },
  );

const verifyToken = (token: string, expectedTokenType: TAuthTokenType, secret: string) => {
  const decoded = jwt.verify(token, secret) as TSignedAuthTokenPayload;

  if (decoded.tokenType !== expectedTokenType) {
    throw new Error("Invalid token type");
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  } satisfies AuthTokenPayload;
};

export const signAccessToken = (payload: AuthTokenPayload) =>
  signToken(payload, "access", env.JWT_SECRET, env.JWT_EXPIRES_IN);

export const signRefreshToken = (payload: AuthTokenPayload) =>
  signToken(payload, "refresh", env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);

export const verifyAccessToken = (token: string) => verifyToken(token, "access", env.JWT_SECRET);

export const verifyRefreshToken = (token: string) =>
  verifyToken(token, "refresh", env.JWT_REFRESH_SECRET);

const getCookieOptions = (expiresIn: string) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: parseJwtExpiresInToMs(expiresIn),
  path: "/",
});

export const getAccessCookieOptions = () => getCookieOptions(env.JWT_EXPIRES_IN);

export const getRefreshCookieOptions = () => getCookieOptions(env.JWT_REFRESH_EXPIRES_IN);

export const getCookieClearOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
});

export const accessTokenCookieName = accessCookieNameValue;
export const refreshTokenCookieName = refreshCookieNameValue;
export const authCookieName = accessCookieNameValue;
export const legacyAuthCookieName = legacyCookieName;
