import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { AppError } from "../app/utils/AppError";

let isConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(
      500,
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    isConfigured = true;
  }
};

export const getCloudinary = () => {
  ensureCloudinaryConfigured();
  return cloudinary;
};
