import { prisma } from "@/lib/prisma";

import type {
  CreateRoomDTO,
  UpdateRoomDTO,
} from "../dto/room.dto";

export const roomRepository = {
  async findAll(clientId: string) {
    return prisma.room.findMany({
      where: {
        facility: {
          clientId,
        },
      },
      include: {
        facility: true,
      },
      orderBy: [
        {
          facility: {
            name: "asc",
          },
        },
        {
          number: "asc",
        },
      ],
    });
  },

  async findById(id: string, clientId: string) {
    return prisma.room.findFirst({
      where: {
        id,
        facility: {
          clientId,
        },
      },
      include: {
        facility: true,
      },
    });
  },

  async create(data: CreateRoomDTO) {
    return prisma.room.create({
      data,
    });
  },

  async update(
    id: string,
    data: UpdateRoomDTO
  ) {
    return prisma.room.update({
      where: {
        id,
      },
      data,
    });
  },

  async delete(id: string) {
    return prisma.room.delete({
      where: {
        id,
      },
    });
  },
};