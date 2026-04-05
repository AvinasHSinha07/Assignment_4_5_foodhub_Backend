import { OrderStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { TUpdateProviderOrderStatusInput } from "./providerOrder.validation";

const mapProviderOrder = (order: {
  id: string;
  totalPrice: unknown;
  deliveryAddress: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
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
}) => ({
  id: order.id,
  totalPrice: Number(order.totalPrice),
  deliveryAddress: order.deliveryAddress,
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  stripePaymentIntentId: order.stripePaymentIntentId,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  customer: order.customer,
  items: order.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    meal: item.meal,
  })),
});

const getProviderOrders = async (providerId: string, pageInput?: number, limitInput?: number) => {
  const page = pageInput && pageInput > 0 ? pageInput : 1;
  const limit = limitInput && limitInput > 0 ? Math.min(limitInput, 20) : 10;
  const skip = (page - 1) * limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { providerId } }),
    prisma.order.findMany({
      where: { providerId },
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
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
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
    data: orders.map(mapProviderOrder),
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getProviderOrderById = async (providerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      providerId,
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
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
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

  return mapProviderOrder(order);
};

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  PLACED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

const updateProviderOrderStatus = async (
  providerId: string,
  orderId: string,
  payload: TUpdateProviderOrderStatusInput,
) => {
  const existing = await prisma.order.findFirst({
    where: {
      id: orderId,
      providerId,
    },
    select: {
      id: true,
      orderStatus: true,
    },
  });

  if (!existing) {
    throw new AppError(404, "Order not found");
  }

  if (!statusFlow[existing.orderStatus].includes(payload.orderStatus) && existing.orderStatus !== payload.orderStatus) {
    throw new AppError(400, `Invalid status transition from ${existing.orderStatus} to ${payload.orderStatus}`);
  }

  const order = await prisma.order.update({
    where: { id: existing.id },
    data: {
      orderStatus: payload.orderStatus,
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
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
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

  return mapProviderOrder(order);
};

export const ProviderOrderService = {
  getProviderOrders,
  getProviderOrderById,
  updateProviderOrderStatus,
};
