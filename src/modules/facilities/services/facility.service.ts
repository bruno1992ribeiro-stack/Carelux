import { FacilityStatus } from "@prisma/client";

import {
  facilityRepository,
  type FacilityListStatus,
} from "../repository/facility.repository";

import {
  facilitySchema,
  type FacilityInput,
} from "../schemas/facility.schema";

import { AppError } from "@/lib/errors/app-error";

export const facilityService = {
  async findAll(
    clientId: string,
    status: FacilityListStatus = "ALL",
    facilityId?: string
  ) {
    return facilityRepository.findAll(clientId, status, facilityId);
  },

  async getById(id: string, clientId: string) {
    const facility = await facilityRepository.findById(
      id,
      clientId
    );

    if (!facility) {
      throw new AppError(
        "FACILITY_NOT_FOUND",
        "Unidade não encontrada.",
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
        "Unidade não encontrada.",
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

  async deactivate(id: string, clientId: string, actorFacilityId: string | null) {
    return facilityRepository.transaction(async (tx) => {
      const context = await facilityRepository.getDeactivationContext(
        id,
        clientId,
        tx
      );

      if (!context) {
        throw new AppError(
          "FACILITY_NOT_FOUND",
          "Unidade não encontrada.",
          404
        );
      }

      if (context.facility.status !== FacilityStatus.ACTIVE) {
        throw new AppError(
          "FACILITY_ALREADY_INACTIVE",
          "Esta unidade já está inativa.",
          409
        );
      }

      if (actorFacilityId === id) {
        throw new AppError(
          "ADMIN_ASSIGNED_TO_FACILITY",
          "Reassocie primeiro a sua conta a outra unidade.",
          409
        );
      }

      if (context.activeFacilities <= 1) {
        throw new AppError(
          "LAST_ACTIVE_FACILITY",
          "Não é possível desativar a última unidade ativa.",
          409
        );
      }

      if (context.activeUsers > 0) {
        throw new AppError(
          "ACTIVE_USERS_ASSIGNED",
          "Reassocie primeiro os utilizadores ativos desta unidade.",
          409
        );
      }

      if (context.activeStaff > 0) {
        throw new AppError(
          "ACTIVE_STAFF_ASSIGNED",
          "Existem funcionários ativos associados a esta unidade.",
          409
        );
      }

      if (context.activeResidents > 0) {
        throw new AppError(
          "ACTIVE_RESIDENTS_ASSIGNED",
          "Existem utentes ativos ou hospitalizados associados a esta unidade.",
          409
        );
      }

      const result = await facilityRepository.updateStatus(
        id,
        clientId,
        FacilityStatus.ACTIVE,
        FacilityStatus.INACTIVE,
        tx
      );

      if (result.count !== 1) {
        throw new AppError(
          "FACILITY_STATUS_CONFLICT",
          "O estado da unidade foi alterado. Atualize a página e tente novamente.",
          409
        );
      }
    });
  },

  async reactivate(id: string, clientId: string) {
    return facilityRepository.transaction(async (tx) => {
      const facility = await tx.facility.findFirst({
        where: { id, clientId },
        select: { status: true },
      });

      if (!facility) {
        throw new AppError(
          "FACILITY_NOT_FOUND",
          "Unidade não encontrada.",
          404
        );
      }

      if (facility.status !== FacilityStatus.INACTIVE) {
        throw new AppError(
          "FACILITY_ALREADY_ACTIVE",
          "Esta unidade já está ativa.",
          409
        );
      }

      const result = await facilityRepository.updateStatus(
        id,
        clientId,
        FacilityStatus.INACTIVE,
        FacilityStatus.ACTIVE,
        tx
      );

      if (result.count !== 1) {
        throw new AppError(
          "FACILITY_STATUS_CONFLICT",
          "O estado da unidade foi alterado. Atualize a página e tente novamente.",
          409
        );
      }
    });
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
        "Unidade não encontrada.",
        404
      );
    }

    return facilityRepository.delete(id);
  },
};
