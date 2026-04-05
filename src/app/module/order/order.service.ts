import { PaymentMethod } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import type {
  TCreateOrderInput,
  TGetMyOrdersResult,
  TOrderSummary,
  TPaymentMethodInput,
} from "./order.interface";

type TOrderWithRelations = {
  id: string;
  totalPrice: unknown;
  deliveryAddress: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  provider: {
    id: string;
    name: string;
    providerProfile: {
      restaurantName: string;
    } | null;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: unknown;
    totalPrice: unknown;
    meal: {
      id: string;
      title: string;
      image: string | null;
    };
  }[];
};

const mapPaymentMethod = (paymentMethod: PaymentMethod): TPaymentMethodInput => {
  if (paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
    return "CASH_ON_DELIVERY";
  }

  return "STRIPE";
};

const mapOrderSummary = (order: TOrderWithRelations): TOrderSummary => ({
  id: order.id,
  totalPrice: Number(order.totalPrice),
  deliveryAddress: order.deliveryAddress,
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  paymentMethod: mapPaymentMethod(order.paymentMethod),
  stripePaymentIntentId: order.stripePaymentIntentId,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  provider: {
    id: order.provider.id,
    name: order.provider.name,
    restaurantName: order.provider.providerProfile?.restaurantName ?? null,
  },
  items: order.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    meal: item.meal,
  })),
});

const getOrderByIdOrThrow = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId,
    },
    select: {
      id: true,
      totalPrice: true,
      deliveryAddress: true,
      orderStatus: true,
      paymentStatus: true,
      paymentMethod: true,
      stripePaymentIntentId: true,
      createdAt: true,
      updatedAt: true,
      provider: {
        select: {
          id: true,
          name: true,
          providerProfile: {
            select: {
              restaurantName: true,
            },
          },
        },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          meal: {
            select: {
              id: true,
              title: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return mapOrderSummary(order);
};

const createOrder = async (customerId: string, payload: TCreateOrderInput) => {
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

  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customerId,
        providerId,
        totalPrice,
        deliveryAddress: payload.deliveryAddress.trim(),
        paymentMethod:
          payload.paymentMethod === "CASH_ON_DELIVERY"
            ? PaymentMethod.CASH_ON_DELIVERY
            : PaymentMethod.STRIPE,
      },
      select: {
        id: true,
      },
    });

    await tx.orderItem.createMany({
      data: orderItems.map((item) => ({
        orderId: order.id,
        mealId: item.mealId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    });

    return order;
  });

  return getOrderByIdOrThrow(customerId, createdOrder.id);
};

const getMyOrders = async (
  customerId: string,
  pageInput?: number,
  limitInput?: number,
): Promise<TGetMyOrdersResult> => {
  const page = pageInput && pageInput > 0 ? pageInput : 1;
  const limit = limitInput && limitInput > 0 ? Math.min(limitInput, 20) : 10;
  const skip = (page - 1) * limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { customerId } }),
    prisma.order.findMany({
      where: {
        customerId,
      },
      select: {
        id: true,
        totalPrice: true,
        deliveryAddress: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        stripePaymentIntentId: true,
        createdAt: true,
        updatedAt: true,
        provider: {
          select: {
            id: true,
            name: true,
            providerProfile: {
              select: {
                restaurantName: true,
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            meal: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
  ]);

  return {
    data: orders.map(mapOrderSummary),
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getMyOrderById = async (customerId: string, orderId: string) => {
  return getOrderByIdOrThrow(customerId, orderId);
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getMyOrderById,
};
