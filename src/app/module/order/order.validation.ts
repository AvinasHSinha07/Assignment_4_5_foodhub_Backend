import { z } from "zod";

export const createOrderSchema = z.object({
  deliveryAddress: z.string().trim().min(10, "Delivery address must be at least 10 characters"),
  paymentMethod: z.enum(["STRIPE", "CASH_ON_DELIVERY"]).optional(),
  items: z
    .array(
      z.object({
        mealId: z.string().min(1, "Meal id is required"),
        quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
});

export type TCreateOrderValidationInput = z.infer<typeof createOrderSchema>;
