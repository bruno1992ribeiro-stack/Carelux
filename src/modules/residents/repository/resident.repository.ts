import type { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/prisma";

import type {
  CreateResidentDTO,
  ResidentScope,
  UpdateResidentDTO,
} from "../dto/resident.dto";

type ResidentTransaction = Prisma.TransactionClient;
type ResidentDb = typeof prisma | ResidentTransaction;

function getScopeWhere(scope: ResidentScope): Prisma.ResidentWhereInput {
  return {
    facility: {
      clientId: scope.clientId,
    },
    ...(scope.facilityId
      ? {
          facilityId: scope.facilityId,
        }
      : {}),
  };
}

function getBedScopeWhere(
  bedId: string,
  scope: ResidentScope
): Prisma.BedWhereInput {
  return {
    id: bedId,
    room: {
      facility: {
        clientId: scope.clientId,
      },
      ...(scope.facilityId
        ? {
            facilityId: scope.facilityId,
          }
        : {}),
    },
  };
}

export const residentRepository = {
  async transaction<T>(callback: (tx: ResidentTransaction) => Promise<T>) {
    return prisma.$transaction(callback, {
      isolationLevel: "Serializable",
    });
  },

  async findAll(scope: ResidentScope, db: ResidentDb = prisma) {
    return db.resident.findMany({
      where: getScopeWhere(scope),
      include: {
        facility: true,
        room: true,
        bed: true,
      },
      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
      ],
    });
  },

  async findById(
    id: string,
    scope: ResidentScope,
    db: ResidentDb = prisma
  ) {
    return db.resident.findFirst({
      where: {
        id,
        ...getScopeWhere(scope),
      },
      include: {
        facility: true,
        room: true,
        bed: true,
      },
    });
  },

  async findFacilityById(
    facilityId: string,
    scope: ResidentScope,
    db: ResidentDb = prisma
  ) {
    return db.facility.findFirst({
      where: {
        id: facilityId,
        clientId: scope.clientId,
        ...(scope.facilityId
          ? {
              AND: {
                id: scope.facilityId,
              },
            }
          : {}),
      },
    });
  },

  async findRoomById(
    roomId: string,
    facilityId: string,
    scope: ResidentScope,
    db: ResidentDb = prisma
  ) {
    return db.room.findFirst({
      where: {
        id: roomId,
        facilityId,
        facility: {
          clientId: scope.clientId,
        },
      },
    });
  },

  async findBedById(
    bedId: string,
    roomId: string,
    facilityId: string,
    scope: ResidentScope,
    db: ResidentDb = prisma
  ) {
    return db.bed.findFirst({
      where: {
        id: bedId,
        roomId,
        room: {
          facilityId,
          facility: {
            clientId: scope.clientId,
          },
        },
      },
    });
  },

  async findBedOccupant(
    bedId: string,
    excludedResidentId?: string,
    db: ResidentDb = prisma
  ) {
    return db.resident.findFirst({
      where: {
        bedId,
        status: {
          in: ["ACTIVE", "HOSPITALIZED"],
        },
        ...(excludedResidentId
          ? {
              id: {
                not: excludedResidentId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });
  },

  async create(
    scope: ResidentScope,
    data: CreateResidentDTO,
    db: ResidentDb = prisma
  ) {
    return db.resident.create({
      data: {
        ...data,
        facilityId: scope.facilityId ?? data.facilityId,
      },
      include: {
        facility: true,
        room: true,
        bed: true,
      },
    });
  },

  async update(
    id: string,
    scope: ResidentScope,
    data: UpdateResidentDTO,
    db: ResidentDb = prisma
  ) {
    const result = await db.resident.updateMany({
      where: {
        id,
        ...getScopeWhere(scope),
      },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return residentRepository.findById(id, scope, db);
  },

  async delete(
    id: string,
    scope: ResidentScope,
    db: ResidentDb = prisma
  ) {
    const result = await db.resident.deleteMany({
      where: {
        id,
        ...getScopeWhere(scope),
      },
    });

    return result.count > 0;
  },

  async syncBedOccupancy(
    bedId: string,
    scope: ResidentScope,
    tx: ResidentTransaction
  ) {
    const bedWhere = getBedScopeWhere(bedId, scope);

    const bed = await tx.bed.findFirst({
      where: bedWhere,
      select: {
        id: true,
      },
    });

    if (!bed) {
      throw new AppError(
        "BED_NOT_FOUND",
        "A cama não pertence ao cliente autenticado.",
        404
      );
    }

    const occupant = await residentRepository.findBedOccupant(
      bedId,
      undefined,
      tx
    );

    const result = await tx.bed.updateMany({
      where: bedWhere,
      data: {
        occupied: Boolean(occupant),
      },
    });

    if (result.count !== 1) {
      throw new AppError(
        "BED_NOT_FOUND",
        "A cama não pertence ao cliente autenticado.",
        404
      );
    }

    return Boolean(occupant);
  },
};
