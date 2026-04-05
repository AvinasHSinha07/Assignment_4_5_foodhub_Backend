import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

export const validateRequest = (schema: ZodTypeAny) => (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const flattened = result.error.flatten();
    const validationMessage =
      Object.values(flattened.fieldErrors).flat().filter(Boolean).join(", ") ||
      flattened.formErrors.join(", ") ||
      "Validation failed";

    return next(new AppError(400, validationMessage));
  }

  req.body = result.data;
  return next();
};
