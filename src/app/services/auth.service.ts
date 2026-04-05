import { UserRole, UserStatus } from "@prisma/client";
import type { IncomingHttpHeaders } from "http";
import { callBetterAuthEndpoint, getBetterAuthSession, type TCallBetterAuthEndpointResult } from "../../lib/betterAuth";
import { prisma } from "../../lib/prisma";
import { AppError } from "../utils/AppError";
import type { LoginInput, RegisterInput } from "../validations/auth.validation";

const mapSessionUser = (user: Record<string, unknown>) => ({
  id: String(user.id),
  name: String(user.name),
  email: String(user.email),
  role: user.role as UserRole,
  status: user.status as UserStatus,
  phone: user.phone ? String(user.phone) : null,
  avatar: user.image ? String(user.image) : null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const extractMessageFromBody = (body: unknown, fallback: string) => {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  if ("message" in body && typeof body.message === "string") {
    return body.message;
  }

  return fallback;
};

const ensureRoleCanRegister = (role: UserRole) => {
  if (role === UserRole.ADMIN) {
    throw new AppError(403, "You cannot register as admin");
  }
};

const getUserIdFromAuthBody = (body: unknown) => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const maybeUser = (body as { user?: unknown }).user;

  if (!maybeUser || typeof maybeUser !== "object") {
    return null;
  }

  const maybeId = (maybeUser as { id?: unknown }).id;

  if (typeof maybeId !== "string" || maybeId.length === 0) {
    return null;
  }

  return maybeId;
};

export const syncUserPasswordFromCredentialAccount = async (userId: string) => {
  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "credential",
      password: {
        not: null,
      },
    },
    select: {
      password: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!credentialAccount?.password) {
    return false;
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: credentialAccount.password,
    },
  });

  return true;
};

export const syncUserPasswordFromAuthBody = async (body: unknown) => {
  const userId = getUserIdFromAuthBody(body);

  if (!userId) {
    return false;
  }

  return syncUserPasswordFromCredentialAccount(userId);
};

export const registerUser = async (
  input: RegisterInput,
  requestHeaders: IncomingHttpHeaders,
): Promise<TCallBetterAuthEndpointResult> => {
  ensureRoleCanRegister(input.role);

  return callBetterAuthEndpoint({
    path: "/sign-up/email",
    method: "POST",
    requestHeaders,
    body: {
      name: input.name.trim(),
      email: input.email,
      password: input.password,
      role: input.role,
      phone: input.phone?.trim() || undefined,
    },
  });
};

export const loginUser = async (
  input: LoginInput,
  requestHeaders: IncomingHttpHeaders,
): Promise<TCallBetterAuthEndpointResult> => {
  return callBetterAuthEndpoint({
    path: "/sign-in/email",
    method: "POST",
    requestHeaders,
    body: {
      email: input.email,
      password: input.password,
      rememberMe: true,
    },
  });
};

export const logoutUser = async (
  requestHeaders: IncomingHttpHeaders,
): Promise<TCallBetterAuthEndpointResult> => {
  return callBetterAuthEndpoint({
    path: "/sign-out",
    method: "POST",
    requestHeaders,
  });
};

export const refreshUserSession = async (requestHeaders: IncomingHttpHeaders) => {
  const session = (await getBetterAuthSession(requestHeaders)) as {
    user?: Record<string, unknown>;
  } | null;

  if (!session?.user) {
    throw new AppError(401, "Unauthorized access");
  }

  const user = mapSessionUser(session.user);

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(403, "Your account is suspended");
  }

  return user;
};

export const getCurrentUser = async (requestHeaders: IncomingHttpHeaders) => {
  const session = (await getBetterAuthSession(requestHeaders)) as {
    user?: Record<string, unknown>;
  } | null;

  if (!session?.user) {
    throw new AppError(401, "Unauthorized access");
  }

  const user = mapSessionUser(session.user);

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(403, "Your account is suspended");
  }

  return user;
};

export const getBetterAuthMessage = extractMessageFromBody;
