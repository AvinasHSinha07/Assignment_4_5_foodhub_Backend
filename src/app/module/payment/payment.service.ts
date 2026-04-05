import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { getStripe, getStripeWebhookSecret } from "../../../lib/stripe";
import { AppError } from "../../utils/AppError";
import { OrderService } from "../order/order.service";
import type {
  TConfirmPaymentInput,
  TCreatePaymentIntentInput,
  TPaymentIntentResponse,
} from "./payment.interface";

type TResolvedOrderItem = {
  mealId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type TOrderQuote = {
  providerId: string;
  deliveryAddress: string;
  totalPrice: number;
  totalPriceCents: number;
  orderItems: TResolvedOrderItem[];
};

const buildOrderQuote = async (payload: TCreatePaymentIntentInput): Promise<TOrderQuote> => {
  if (payload.items.length === 0) {
    throw new AppError(400, "At least one item is required");
  }

  const normalizedQuantityByMeal = payload.items.reduce<Record<string, number>>((acc, item) => {
    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError(400, "Quantity must be a positive integer");
    }

    acc[item.mealId] = (acc[item.mealId] ?? 0) + quantity;
    return acc;
  }, {});

  const mealIds = Object.keys(normalizedQuantityByMeal);

  const meals = await prisma.meal.findMany({
    where: {
      id: { in: mealIds },
      isAvailable: true,
    },
    select: {
      id: true,
      providerId: true,
      price: true,
    },
  });

  if (meals.length !== mealIds.length) {
    throw new AppError(404, "One or more selected meals are unavailable");
  }

  const providerId = meals[0]?.providerId;

  if (!providerId || meals.some((meal) => meal.providerId !== providerId)) {
    throw new AppError(400, "All cart items must belong to the same provider");
  }

  const orderItems = meals.map((meal) => {
    const quantity = normalizedQuantityByMeal[meal.id];
    const unitPrice = Number(meal.price);
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    return {
      mealId: meal.id,
      quantity,
      unitPrice,
      totalPrice,
    };
  });

  const totalPrice = Number(orderItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
  const totalPriceCents = Math.round(totalPrice * 100);

  return {
    providerId,
    deliveryAddress: payload.deliveryAddress.trim(),
    totalPrice,
    totalPriceCents,
    orderItems,
  };
};

const createPaymentIntent = async (
  customerId: string,
  payload: TCreatePaymentIntentInput,
): Promise<TPaymentIntentResponse> => {
  const quote = await buildOrderQuote(payload);
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: quote.totalPriceCents,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      customerId,
      providerId: quote.providerId,
      totalPrice: quote.totalPrice.toFixed(2),
      deliveryAddress: quote.deliveryAddress,
    },
  });

  if (!paymentIntent.client_secret) {
    throw new AppError(500, "Failed to create payment intent");
  }

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amount: quote.totalPrice,
    currency: paymentIntent.currency,
  };
};

const confirmPayment = async (customerId: string, payload: TConfirmPaymentInput) => {
  const existingOrder = await prisma.order.findFirst({
    where: {
      customerId,
      stripePaymentIntentId: payload.paymentIntentId,
    },
    select: {
      id: true,
    },
  });

  if (existingOrder) {
    return OrderService.getMyOrderById(customerId, existingOrder.id);
  }

  const quote = await buildOrderQuote(payload);
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(payload.paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new AppError(400, "Payment is not completed yet");
  }

  if (paymentIntent.currency !== "usd") {
    throw new AppError(400, "Unexpected payment currency");
  }

  if (paymentIntent.amount_received < quote.totalPriceCents) {
    throw new AppError(400, "Payment amount is insufficient");
  }

  if (paymentIntent.amount !== quote.totalPriceCents) {
    throw new AppError(400, "Payment amount does not match cart total");
  }

  if (paymentIntent.metadata?.customerId && paymentIntent.metadata.customerId !== customerId) {
    throw new AppError(403, "Payment intent does not belong to this customer");
  }

  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerId,
        providerId: quote.providerId,
        totalPrice: quote.totalPrice,
        deliveryAddress: quote.deliveryAddress,
        paymentStatus: PaymentStatus.PAID,
        stripePaymentIntentId: paymentIntent.id,
      },
      select: {
        id: true,
      },
    });

    await tx.orderItem.createMany({
      data: quote.orderItems.map((item) => ({
        orderId: order.id,
        mealId: item.mealId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    });

    return order;
  });

  return OrderService.getMyOrderById(customerId, createdOrder.id);
};

const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  switch (event.type) {
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await prisma.order.updateMany({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      await prisma.order.updateMany({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      if (typeof charge.payment_intent === "string") {
        await prisma.order.updateMany({
          where: {
            stripePaymentIntentId: charge.payment_intent,
          },
          data: {
            paymentStatus: PaymentStatus.REFUNDED,
          },
        });
      }
      break;
    }

    default:
      break;
  }

  return {
    received: true,
    eventId: event.id,
    eventType: event.type,
  };
};

export const PaymentService = {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
};
