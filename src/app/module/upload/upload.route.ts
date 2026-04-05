import { UserRole } from "@prisma/client";
import { Router } from "express";
import multer from "multer";
import { AppError } from "../../utils/AppError";
import { checkAuth } from "../../middleware/checkAuth";
import { UploadController } from "./upload.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new AppError(400, "Only image files are allowed"));
  },
});

router.post(
  "/image",
  checkAuth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  upload.single("image"),
  UploadController.uploadImage,
);

router.delete(
  "/image/:publicId",
  checkAuth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  UploadController.deleteImage,
);

export const UploadRoutes = router;
