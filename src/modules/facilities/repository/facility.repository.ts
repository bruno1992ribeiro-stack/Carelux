import { FacilityStatus, ResidentStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  CreateFacilityDTO,
  UpdateFacilityDTO,
} from "../dto/facility.dto";

export type FacilityListStatus = FacilityStatus | "ALL";

export const facilityRepository = {
  async findAll(
    clientId: string,
    status: FacilityListStatus = "ALL",
    facilityId?: string
  ) {
    return prisma.facility.findMany({
      where: {
        clientId,
        ...(facilityId ? { id: facilityId } : {}),
        ...(status === "ALL" ? {} : { status }),
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async findById(id: string, clientId: string) {
    return prisma.facility.findFirst({
      where: {
        id,
        clientId,
      },
    });
  },

  async create(clientId: string, data: CreateFacilityDTO) {
    return prisma.facility.create({
      data: {
        clientId,
        ...data,
      },
    });
  },

  async update(
    id: string,
    clientId: string,
    data: UpdateFacilityDTO
  ) {
    return prisma.facility.update({
      where: {
        id,
      },
      data,
    });
  },

  async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ) {
    return prisma.$transaction(callback, {
      isolationLevel: "Serializable",
    });
  },

  async getDeactivationContext(
    id: string,
    clientId: string,
    tx: Prisma.TransactionClient
  ) {
    const facility = await tx.facility.findFirst({
      where: { id, clientId },
      select: { id: true, status: true },
    });

    if (!facility) {
      return null;
    }

    const [activeFacilities, activeUsers, activeResidents] =
      await Promise.all([
        tx.facility.count({
          where: { clientId, status: FacilityStatus.ACTIVE },
        }),
        tx.user.count({
          where: { facilityId: id, clientId, active: true },
        }),
        tx.resident.count({
          where: {
            facilityId: id,
            facility: { clientId },
            status: {
              in: [ResidentStatus.ACTIVE, ResidentStatus.HOSPITALIZED],
            },
          },
        }),
      ]);

    return {
      facility,
      activeFacilities,
      activeUsers,
      activeResidents,
    };
  },

  async updateStatus(
    id: string,
    clientId: string,
    currentStatus: FacilityStatus,
    nextStatus: FacilityStatus,
    tx: Prisma.TransactionClient
  ) {
    return tx.facility.updateMany({
      where: { id, clientId, status: currentStatus },
      data: { status: nextStatus },
    });
  },
};
