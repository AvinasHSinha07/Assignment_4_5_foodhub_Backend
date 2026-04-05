import { UserRole } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { TUpsertProviderProfileInput } from "./providerProfile.validation";

const ensureProviderRole = async (providerId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: providerId },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== UserRole.PROVIDER) {
    throw new AppError(403, "Only provider accounts can manage provider profile");
  }
};

const getMyProviderProfile = async (providerId: string) => {
  await ensureProviderRole(providerId);

  const profile = await prisma.providerProfile.findUnique({
    where: {
      userId: providerId,
    },
    select: {
      id: true,
      userId: true,
      restaurantName: true,
      description: true,
      address: true,
      cuisineType: true,
      logo: true,
      bannerImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return profile;
};

const upsertMyProviderProfile = async (providerId: string, payload: TUpsertProviderProfileInput) => {
  await ensureProviderRole(providerId);

  return prisma.providerProfile.upsert({
    where: {
      userId: providerId,
    },
    update: {
      restaurantName: payload.restaurantName.trim(),
      description: payload.description?.trim() || null,
      address: payload.address.trim(),
      cuisineType: payload.cuisineType.trim(),
      logo: payload.logo ?? null,
      bannerImage: payload.bannerImage ?? null,
    },
    create: {
      userId: providerId,
      restaurantName: payload.restaurantName.trim(),
      description: payload.description?.trim() || null,
      address: payload.address.trim(),
      cuisineType: payload.cuisineType.trim(),
      logo: payload.logo ?? null,
      bannerImage: payload.bannerImage ?? null,
    },
    select: {
      id: true,
      userId: true,
      restaurantName: true,
      description: true,
      address: true,
      cuisineType: true,
      logo: true,
      bannerImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const ProviderProfileService = {
  getMyProviderProfile,
  upsertMyProviderProfile,
};
