import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  CreateRoomDTO,
  UpdateRoomDTO,
} from "../dto/room.dto";

type RoomTransaction = Prisma.TransactionClient;
type RoomDb = typeof prisma | RoomTransaction;

export const roomRepository = {
  async transaction<T>(callback: (tx: RoomTransaction) => Promise<T>) {
    return prisma.$transaction(callback, {
      isolationLevel: "Serializable",
    });
  },

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

  async findById(id: string, clientId: string, db: RoomDb = prisma) {
    return db.room.findFirst({
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

  async findFacilityById(
    id: string,
    clientId: string,
    db: RoomDb = prisma
  ) {
    return db.facility.findFirst({
      where: { id, clientId },
      select: { id: true, status: true },
    });
  },

  async create(data: CreateRoomDTO, db: RoomDb = prisma) {
    return db.room.create({
      data,
    });
  },

  async update(
    id: string,
    data: UpdateRoomDTO,
    db: RoomDb = prisma
  ) {
    return db.room.update({
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
