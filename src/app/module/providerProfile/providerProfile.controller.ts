import type { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProviderProfileService } from "./providerProfile.service";

const getMyProviderProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const profile = await ProviderProfileService.getMyProviderProfile(req.user.userId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider profile fetched successfully",
    data: profile,
  });
});

const upsertMyProviderProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const profile = await ProviderProfileService.upsertMyProviderProfile(req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Provider profile saved successfully",
    data: profile,
  });
});

export const ProviderProfileController = {
  getMyProviderProfile,
  upsertMyProviderProfile,
};
