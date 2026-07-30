import { prisma } from "@/lib/prisma";

import type {
  CreateBedDTO,
  UpdateBedDTO,
} from "../dto/bed.dto";

export const bedRepository = {
  async findAll(clientId: string) {
    return prisma.bed.findMany({
      where: {
        room: {
          facility: {
            clientId,
          },
        },
      },

      include: {
        room: {
          include: {
            facility: true,
          },
        },
      },

      orderBy: [
        {
          room: {
            facility: {
              name: "asc",
            },
          },
        },
        {
          room: {
            number: "asc",
          },
        },
        {
          identifier: "asc",
        },
      ],
    });
  },

  async findById(
    id: string,
    clientId: string
  ) {
    return prisma.bed.findFirst({
      where: {
        id,
        room: {
          facility: {
            clientId,
          },
        },
      },

      include: {
        room: {
          include: {
            facility: true,
          },
        },
      },
    });
  },

  async findRoomById(
    roomId: string,
    clientId: string
  ) {
    return prisma.room.findFirst({
      where: {
        id: roomId,
        facility: {
          clientId,
        },
      },
    });
  },

  async findDuplicate(
    roomId: string,
    identifier: string,
    excludedBedId?: string
  ) {
    return prisma.bed.findFirst({
      where: {
        roomId,
        identifier,
        ...(excludedBedId
          ? {
              id: {
                not: excludedBedId,
              },
            }
          : {}),
      },
    });
  },

  async create(data: CreateBedDTO) {
    return prisma.bed.create({
      data,
    });
  },

  async update(
    id: string,
    data: UpdateBedDTO
  ) {
    return prisma.bed.update({
      where: {
        id,
      },
      data,
    });
  },

  async delete(id: string) {
    return prisma.bed.delete({
      where: {
        id,
      },
    });
  },
};