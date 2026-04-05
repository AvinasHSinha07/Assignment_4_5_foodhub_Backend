import type { Request, Response } from "express";
import { getCurrentUser, loginUser, registerUser } from "../services/auth.service";
import { catchAsync } from "../shared/catchAsync";
import { sendResponse } from "../shared/sendResponse";
import { authCookieName } from "../utils/auth";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.cookie(authCookieName, result.token, result.cookieOptions);
  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "User registered successfully",
    data: {
      user: result.user,
      token: result.token,
    },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.cookie(authCookieName, result.token, result.cookieOptions);
  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Login successful",
    data: {
      user: result.user,
      token: result.token,
    },
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie(authCookieName, { path: "/" });
  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Logout successful",
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

  const user = await getCurrentUser(req.user.userId);
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
  me,
};

export { login, logout, me, register };
