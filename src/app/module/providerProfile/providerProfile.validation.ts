import { z } from "zod";

export const upsertProviderProfileSchema = z.object({
  restaurantName: z.string().trim().min(2, "Restaurant name must be at least 2 characters"),
  description: z.string().trim().max(500, "Description is too long").optional(),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
  cuisineType: z.string().trim().min(2, "Cuisine type is required"),
  logo: z.string().url("Logo must be a valid URL").optional(),
  bannerImage: z.string().url("Banner image must be a valid URL").optional(),
});

export type TUpsertProviderProfileInput = z.infer<typeof upsertProviderProfileSchema>;
