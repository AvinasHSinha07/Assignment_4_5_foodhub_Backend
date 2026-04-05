import type { Request, Response } from "express";
import { env } from "../../config/env";
import {
  getBetterAuthMessage,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  syncUserPasswordFromAuthBody,
} from "../services/auth.service";
import { catchAsync } from "../shared/catchAsync";
import { sendResponse } from "../shared/sendResponse";

const roleCookieName = "foodhub_role";

const getRoleCookieOptions = () => ({
  httpOnly: false,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

const setRoleCookie = (res: Response, role: unknown) => {
  if (typeof role !== "string") {
    return;
  }

  res.cookie(roleCookieName, role, getRoleCookieOptions());
};

const clearRoleCookie = (res: Response) => {
  res.clearCookie(roleCookieName, { path: "/" });
};

const appendSetCookies = (res: Response, setCookies: string[]) => {
  if (setCookies.length === 0) {
    return;
  }

  res.setHeader("Set-Cookie", setCookies);
};

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await registerUser(req.body, req.headers);
  appendSetCookies(res, result.setCookies);

  const message = getBetterAuthMessage(result.body, "User registration failed");

  if (result.status >= 400) {
    sendResponse(res, {
      success: false,
      httpStatusCode: result.status,
      message,
    });
    return;
  }

  const body = result.body as { user?: { role?: string } } | null;
  setRoleCookie(res, body?.user?.role);
  await syncUserPasswordFromAuthBody(body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message,
    data: {
      user: body?.user,
    },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await loginUser(req.body, req.headers);
  appendSetCookies(res, result.setCookies);

  const message = getBetterAuthMessage(result.body, "Login failed");

  if (result.status >= 400) {
    sendResponse(res, {
      success: false,
      httpStatusCode: result.status,
      message,
    });
    return;
  }

  const body = result.body as { user?: { role?: string } } | null;
  setRoleCookie(res, body?.user?.role);
  await syncUserPasswordFromAuthBody(body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message,
    data: {
      user: body?.user,
    },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const result = await logoutUser(req.headers);
  appendSetCookies(res, result.setCookies);
  clearRoleCookie(res);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Logout successful",
  });
});

const refresh = catchAsync(async (req: Request, res: Response) => {
  const user = await refreshUserSession(req.headers);
  setRoleCookie(res, user.role);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Session refreshed successfully",
    data: {
      user,
    },
  });
});

const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const user = await getCurrentUser(req.headers);
  setRoleCookie(res, user.role);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Current user fetched successfully",
    data: user,
  });
});

export const AuthController = {
  register,
  login,
  logout,
  refresh,
  me,
};

export { login, logout, me, refresh, register };
