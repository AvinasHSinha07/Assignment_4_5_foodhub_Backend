import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UploadService } from "./upload.service";

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  if (!req.file) {
    throw new AppError(400, "Image file is required");
  }

  const uploaded = await UploadService.uploadImage(req.file);

  sendResponse(res, {
    success: true,
    httpStatusCode: 201,
    message: "Image uploaded successfully",
    data: uploaded,
  });
});

const deleteImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      success: false,
      httpStatusCode: 401,
      message: "Unauthorized access",
    });
    return;
  }

  const publicId = Array.isArray(req.params.publicId) ? req.params.publicId[0] : req.params.publicId;
  const result = await UploadService.deleteImage(publicId);

  sendResponse(res, {
    success: true,
    httpStatusCode: 200,
    message: "Image deleted successfully",
    data: result,
  });
});

export const UploadController = {
  uploadImage,
  deleteImage,
};
