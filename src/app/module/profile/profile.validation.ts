import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().trim().min(6, "Phone must be at least 6 characters").optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
  image: z.string().url("Image must be a valid URL").optional(),
});

export type TUpdateProfileInput = z.infer<typeof updateProfileSchema>;
