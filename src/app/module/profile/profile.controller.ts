import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProfileService } from "./profile.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const profile = await ProfileService.getMyProfile(req.user.userId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Profile fetched successfully",
    data: profile,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const profile = await ProfileService.updateMyProfile(req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Profile updated successfully",
    data: profile,
  });
});

export const ProfileController = {
  getMyProfile,
  updateMyProfile,
};
