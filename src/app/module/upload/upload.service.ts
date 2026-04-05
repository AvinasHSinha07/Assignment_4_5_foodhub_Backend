import { getCloudinary } from "../../../lib/cloudinary";
import { AppError } from "../../utils/AppError";
import type { TUploadedImage } from "./upload.interface";

const uploadImage = async (file: Express.Multer.File): Promise<TUploadedImage> => {
  const cloudinary = getCloudinary();

  const uploadResult = await new Promise<{ secure_url?: string; public_id?: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          public_id: `foodhub_meal_${Date.now()}`,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    },
  );

  if (!uploadResult.secure_url || !uploadResult.public_id) {
    throw new AppError(500, "Cloudinary did not return a valid upload response");
  }

  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };
};

const deleteImage = async (publicId: string) => {
  const normalizedPublicId = decodeURIComponent(publicId).trim();

  if (!normalizedPublicId) {
    throw new AppError(400, "Image public id is required");
  }

  const cloudinary = getCloudinary();
  const result = await cloudinary.uploader.destroy(normalizedPublicId, {
    resource_type: "image",
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError(400, "Failed to delete image from Cloudinary");
  }

  return {
    deleted: result.result === "ok",
    publicId: normalizedPublicId,
  };
};

export const UploadService = {
  uploadImage,
  deleteImage,
};
