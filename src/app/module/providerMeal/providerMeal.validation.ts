import { z } from "zod";

export const createProviderMealSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  image: z.string().url("Image must be a valid URL").optional(),
  dietaryTag: z.string().trim().min(2).max(60).optional(),
  isAvailable: z.boolean().optional(),
});

export const updateProviderMealSchema = createProviderMealSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required for update",
  });

export type TCreateProviderMealInput = z.infer<typeof createProviderMealSchema>;
export type TUpdateProviderMealInput = z.infer<typeof updateProviderMealSchema>;
