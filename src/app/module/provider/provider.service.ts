import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import type {
  TGetProvidersQuery,
  TGetProvidersResult,
  TProviderDetails,
  TProviderSummary,
} from "./provider.interface";

const mapProviderSummary = (provider: {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
  providerProfile: {
    restaurantName: string;
    description: string | null;
    address: string;
    cuisineType: string;
    logo: string | null;
    bannerImage: string | null;
  } | null;
}): TProviderSummary => ({
  id: provider.id,
  name: provider.name,
  email: provider.email,
  avatar: provider.avatar,
  restaurantName: provider.providerProfile?.restaurantName ?? provider.name,
  description: provider.providerProfile?.description ?? null,
  address: provider.providerProfile?.address ?? "",
  cuisineType: provider.providerProfile?.cuisineType ?? "Unknown",
  logo: provider.providerProfile?.logo ?? null,
  bannerImage: provider.providerProfile?.bannerImage ?? null,
  createdAt: provider.createdAt,
});

const getAllProviders = async (query: TGetProvidersQuery): Promise<TGetProvidersResult> => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 20) : 12;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.UserWhereInput = {
    role: UserRole.PROVIDER,
    providerProfile: {
      is: query.cuisineType
        ? {
            cuisineType: {
              equals: query.cuisineType,
              mode: "insensitive",
            },
          }
        : {},
    },
    ...(query.searchTerm
      ? {
          OR: [
            { name: { contains: query.searchTerm, mode: "insensitive" as const } },
            {
              providerProfile: {
                is: {
                  restaurantName: { contains: query.searchTerm, mode: "insensitive" as const },
                },
              },
            },
            {
              providerProfile: {
                is: {
                  description: { contains: query.searchTerm, mode: "insensitive" as const },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [total, providers] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        providerProfile: {
          select: {
            restaurantName: true,
            description: true,
            address: true,
            cuisineType: true,
            logo: true,
            bannerImage: true,
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
    data: providers
      .filter((provider) => Boolean(provider.providerProfile))
      .map(mapProviderSummary),
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getCuisineTypes = async () => {
  const profiles = await prisma.providerProfile.findMany({
    select: {
      cuisineType: true,
    },
    orderBy: {
      cuisineType: "asc",
    },
  });

  return Array.from(new Set(profiles.map((profile) => profile.cuisineType)));
};

const getProviderById = async (providerId: string): Promise<TProviderDetails> => {
  const provider = await prisma.user.findUnique({
    where: {
      id: providerId,
      role: UserRole.PROVIDER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      providerProfile: {
        select: {
          restaurantName: true,
          description: true,
          address: true,
          cuisineType: true,
          logo: true,
          bannerImage: true,
        },
      },
      providerMeals: {
        where: {
          isAvailable: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          image: true,
          dietaryTag: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
      },
    },
  });

  if (!provider || !provider.providerProfile) {
    throw new AppError(404, "Provider not found");
  }

  const totalMeals = await prisma.meal.count({
    where: {
      providerId,
    },
  });

  const availableMeals = await prisma.meal.count({
    where: {
      providerId,
      isAvailable: true,
    },
  });

  return {
    ...mapProviderSummary(provider),
    meals: provider.providerMeals.map((meal) => ({
      id: meal.id,
      title: meal.title,
      description: meal.description,
      price: Number(meal.price),
      image: meal.image,
      dietaryTag: meal.dietaryTag,
      category: meal.category,
    })),
    stats: {
      totalMeals,
      availableMeals,
    },
  };
};

export const ProviderService = {
  getAllProviders,
  getCuisineTypes,
  getProviderById,
};
