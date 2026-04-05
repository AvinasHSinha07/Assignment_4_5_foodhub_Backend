import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../utils/AppError";
import {
  authCookieName,
  getAuthCookieOptions,
  signAuthToken,
  type AuthTokenPayload,
} from "../utils/auth";
import type { LoginInput, RegisterInput } from "../validations/auth.validation";

const selectUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} satisfies Record<string, boolean>;

type PublicUser = Omit<User, "password">;

const sanitizeUser = (user: User): PublicUser => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const buildTokenPayload = (user: Pick<User, "id" | "email" | "role">): AuthTokenPayload => ({
  userId: user.id,
  email: user.email,
  role: user.role,
});

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email,
      password: passwordHash,
      role: input.role,
      phone: input.phone?.trim() || null,
    },
  });

  const token = signAuthToken(buildTokenPayload(user));

  return {
    user: sanitizeUser(user),
    token,
    cookieName: authCookieName,
    cookieOptions: getAuthCookieOptions(),
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signAuthToken(buildTokenPayload(user));

  return {
    user: sanitizeUser(user),
    token,
    cookieName: authCookieName,
    cookieOptions: getAuthCookieOptions(),
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: selectUser,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};
