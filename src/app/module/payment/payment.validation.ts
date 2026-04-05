import { z } from "zod";

const checkoutItemSchema = z.object({
  mealId: z.string().min(1, "Meal id is required"),
  quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
});

export const createPaymentIntentSchema = z.object({
  deliveryAddress: z.string().trim().min(10, "Delivery address must be at least 10 characters"),
  items: z.array(checkoutItemSchema).min(1, "At least one item is required"),
});

export const confirmPaymentSchema = createPaymentIntentSchema.extend({
  paymentIntentId: z.string().min(1, "Payment intent id is required"),
});

export type TCreatePaymentIntentValidationInput = z.infer<typeof createPaymentIntentSchema>;
export type TConfirmPaymentValidationInput = z.infer<typeof confirmPaymentSchema>;
