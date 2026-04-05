import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import type { TGetProvidersQuery, TGetProvidersResult } from "./provider.interface";

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
      .map((provider) => ({
        id: provider.id,
        name: provider.name,
        email: provider.email,
        avatar: provider.avatar,
        restaurantName: provider.providerProfile!.restaurantName,
        description: provider.providerProfile!.description,
        address: provider.providerProfile!.address,
        cuisineType: provider.providerProfile!.cuisineType,
        logo: provider.providerProfile!.logo,
        bannerImage: provider.providerProfile!.bannerImage,
        createdAt: provider.createdAt,
      })),
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

export const ProviderService = {
  getAllProviders,
  getCuisineTypes,
};
