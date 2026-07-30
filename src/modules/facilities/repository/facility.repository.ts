import { prisma } from "@/lib/prisma";

import type {
  CreateFacilityDTO,
  UpdateFacilityDTO,
} from "../dto/facility.dto";

export const facilityRepository = {
  async findAll(clientId: string) {
    return prisma.facility.findMany({
      where: {
        clientId,
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

  async delete(id: string) {
    return prisma.facility.delete({
      where: {
        id,
      },
    });
  },
};