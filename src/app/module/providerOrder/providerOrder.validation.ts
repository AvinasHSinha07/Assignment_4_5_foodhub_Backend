import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const updateProviderOrderStatusSchema = z.object({
  orderStatus: z.nativeEnum(OrderStatus),
});

export type TUpdateProviderOrderStatusInput = z.infer<typeof updateProviderOrderStatusSchema>;
