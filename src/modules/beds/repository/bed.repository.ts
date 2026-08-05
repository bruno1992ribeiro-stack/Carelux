import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  CreateBedDTO,
  UpdateBedDTO,
} from "../dto/bed.dto";

type BedTransaction = Prisma.TransactionClient;
type BedDb = typeof prisma | BedTransaction;

export const bedRepository = {
  async transaction<T>(callback: (tx: BedTransaction) => Promise<T>) {
    return prisma.$transaction(callback, {
      isolationLevel: "Serializable",
    });
  },

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
    clientId: string,
    db: BedDb = prisma
  ) {
    return db.bed.findFirst({
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
    clientId: string,
    db: BedDb = prisma
  ) {
    return db.room.findFirst({
      where: {
        id: roomId,
        facility: {
          clientId,
        },
      },
      include: {
        facility: {
          select: {
            status: true,
          },
        },
      },
    });
  },

  async findDuplicate(
    roomId: string,
    identifier: string,
    excludedBedId?: string,
    db: BedDb = prisma
  ) {
    return db.bed.findFirst({
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

  async create(data: CreateBedDTO, db: BedDb = prisma) {
    return db.bed.create({
      data,
    });
  },

  async update(
    id: string,
    data: UpdateBedDTO,
    db: BedDb = prisma
  ) {
    return db.bed.update({
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
