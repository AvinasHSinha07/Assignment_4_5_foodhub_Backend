import { z } from "zod";

export const createReviewSchema = z.object({
  mealId: z.string().min(1, "Meal id is required"),
  rating: z.number().int("Rating must be an integer").min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type TCreateReviewInput = z.infer<typeof createReviewSchema>;
