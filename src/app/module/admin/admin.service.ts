import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../utils/AppError";

type TManageUserRolePayload = {
  role: UserRole;
};

type TManageUserStatusPayload = {
  isActive: boolean;
};

type TCategoryPayload = {
  name: string;
  slug?: string;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mapUserSummary = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...user,
  isActive: user.status === UserStatus.ACTIVE,
});

const getUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map(mapUserSummary);
};

const updateUserRole = async (userId: string, payload: TManageUserRolePayload) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return mapUserSummary(user);
};

const updateUserStatus = async (userId: string, payload: TManageUserStatusPayload) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: payload.isActive ? UserStatus.ACTIVE : UserStatus.SUSPENDED,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return mapUserSummary(user);
};

const getOrders = async () => {
  const orders = await prisma.order.findMany({
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
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
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
              price: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map((order) => ({
    ...order,
    totalPrice: Number(order.totalPrice),
    provider: {
      ...order.provider,
      restaurantName: order.provider.providerProfile?.restaurantName ?? null,
    },
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      meal: {
        ...item.meal,
        price: Number(item.meal.price),
      },
    })),
  }));
};

const getDashboardStats = async () => {
  const [totalUsers, totalProviders, totalCustomers, totalOrders, totalMeals] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.PROVIDER } }),
    prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
    prisma.order.count(),
    prisma.meal.count(),
  ]);

  return {
    totalUsers,
    totalProviders,
    totalCustomers,
    totalOrders,
    totalMeals,
  };
};

const deleteProvider = async (providerId: string) => {
  const provider = await prisma.user.findUnique({
    where: {
      id: providerId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!provider || provider.role !== UserRole.PROVIDER) {
    throw new AppError(404, "Provider not found");
  }

  await prisma.user.update({
    where: {
      id: providerId,
    },
    data: {
      status: UserStatus.SUSPENDED,
    },
  });

  return {
    id: providerId,
    isActive: false,
    status: UserStatus.SUSPENDED,
  };
};

const getProviders = async () => {
  return prisma.user.findMany({
    where: {
      role: UserRole.PROVIDER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      status: true,
      createdAt: true,
      providerProfile: {
        select: {
          restaurantName: true,
          cuisineType: true,
          address: true,
        },
      },
      _count: {
        select: {
          providerMeals: true,
          providerOrders: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const createCategory = async (payload: TCategoryPayload) => {
  const normalizedName = payload.name.trim();
  const slugBase = payload.slug?.trim() || normalizedName;
  const slug = slugify(slugBase);

  if (!slug) {
    throw new AppError(400, "Category slug is invalid");
  }

  try {
    return await prisma.category.create({
      data: {
        name: normalizedName,
        slug,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(409, "Category name or slug already exists");
    }

    throw error;
  }
};

const updateCategory = async (categoryId: string, payload: TCategoryPayload) => {
  const data: { name?: string; slug?: string } = {};

  if (payload.name?.trim()) {
    data.name = payload.name.trim();
  }

  if (payload.slug?.trim()) {
    const nextSlug = slugify(payload.slug);

    if (!nextSlug) {
      throw new AppError(400, "Category slug is invalid");
    }

    data.slug = nextSlug;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(400, "No valid category fields provided");
  }

  try {
    return await prisma.category.update({
      where: {
        id: categoryId,
      },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(409, "Category name or slug already exists");
    }

    throw error;
  }
};

const deleteCategory = async (categoryId: string) => {
  try {
    const deleted = await prisma.category.delete({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return deleted;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new AppError(400, "Cannot delete category that is used by meals");
    }

    throw error;
  }
};

export const AdminService = {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getOrders,
  getDashboardStats,
  deleteProvider,
  getProviders,
  createCategory,
  updateCategory,
  deleteCategory,
};
