import { UserRole } from "@prisma/client";
import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters").optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").optional(),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters").optional(),
});
