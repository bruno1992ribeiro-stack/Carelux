import { facilityRepository } from "../repository/facility.repository";

import {
  facilitySchema,
  type FacilityInput,
} from "../schemas/facility.schema";

import { AppError } from "@/lib/errors/app-error";

export const facilityService = {
  async findAll(clientId: string) {
  return facilityRepository.findAll(clientId);
  },

  async getById(id: string, clientId: string) {
    const facility = await facilityRepository.findById(
      id,
      clientId
    );

    if (!facility) {
      throw new AppError(
        "FACILITY_NOT_FOUND",
        "Lar não encontrado.",
        404
      );
    }

    return facility;
  },

  async create(
    clientId: string,
    data: FacilityInput
  ) {
    const validated = facilitySchema.parse(data);

    return facilityRepository.create(
      clientId,
      validated
    );
  },

  async update(
    id: string,
    clientId: string,
    data: Partial<FacilityInput>
  ) {
    const existingFacility =
      await facilityRepository.findById(
        id,
        clientId
      );

    if (!existingFacility) {
      throw new AppError(
        "FACILITY_NOT_FOUND",
        "Lar não encontrado.",
        404
      );
    }

    const validated =
      facilitySchema
        .partial()
        .parse(data);

    return facilityRepository.update(
      id,
      clientId,
      validated
    );
  },

  async delete(
    id: string,
    clientId: string
  ) {
    const existingFacility =
      await facilityRepository.findById(
        id,
        clientId
      );

    if (!existingFacility) {
      throw new AppError(
        "FACILITY_NOT_FOUND",
        "Lar não encontrado.",
        404
      );
    }

    return facilityRepository.delete(id);
  },
};