import { prisma } from "../../../lib/prisma";
import type { TUpdateProfileInput } from "./profile.validation";

const getMyProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateMyProfile = async (userId: string, payload: TUpdateProfileInput) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: payload.name?.trim(),
      phone: payload.phone?.trim(),
      avatar: payload.avatar ?? payload.image,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const ProfileService = {
  getMyProfile,
  updateMyProfile,
};
