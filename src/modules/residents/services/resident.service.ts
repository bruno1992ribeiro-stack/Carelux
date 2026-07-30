import { ResidentStatus } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";

import type {
  CreateResidentDTO,
  ResidentScope,
} from "../dto/resident.dto";
import { residentRepository } from "../repository/resident.repository";
import {
  residentSchema,
  updateResidentSchema,
  type ResidentInput,
  type UpdateResidentInput,
} from "../schemas/resident.schema";

const OCCUPYING_STATUSES = new Set<ResidentStatus>([
  ResidentStatus.ACTIVE,
  ResidentStatus.HOSPITALIZED,
]);

function occupiesBed(status: ResidentStatus) {
  return OCCUPYING_STATUSES.has(status);
}

function normalizeLocation(data: ResidentInput): CreateResidentDTO {
  if (!occupiesBed(data.status)) {
    return {
      ...data,
      roomId: null,
      bedId: null,
    };
  }

  return data;
}

async function validateLocation(
  scope: ResidentScope,
  data: CreateResidentDTO,
  excludedResidentId: string | undefined,
  currentBedId: string | null | undefined,
  tx: Parameters<Parameters<typeof residentRepository.transaction>[0]>[0]
) {
  const facility = await residentRepository.findFacilityById(
    data.facilityId,
    scope,
    tx
  );

  if (!facility) {
    throw new AppError(
      "FACILITY_NOT_FOUND",
      "O lar selecionado não pertence ao cliente autenticado.",
      404
    );
  }

  if (!data.roomId) {
    return;
  }

  const room = await residentRepository.findRoomById(
    data.roomId,
    data.facilityId,
    scope,
    tx
  );

  if (!room) {
    throw new AppError(
      "ROOM_NOT_FOUND",
      "O quarto selecionado não pertence ao lar do utente.",
      404
    );
  }

  if (!data.bedId) {
    return;
  }

  const bed = await residentRepository.findBedById(
    data.bedId,
    data.roomId,
    data.facilityId,
    scope,
    tx
  );

  if (!bed) {
    throw new AppError(
      "BED_NOT_FOUND",
      "A cama selecionada não pertence ao quarto do utente.",
      404
    );
  }

  if (!bed.active) {
    throw new AppError(
      "BED_INACTIVE",
      "A cama selecionada não está ativa.",
      409
    );
  }

  if (bed.occupied && bed.id !== currentBedId) {
    throw new AppError(
      "BED_OCCUPIED",
      "A cama selecionada já está ocupada.",
      409
    );
  }

  const occupant = await residentRepository.findBedOccupant(
    data.bedId,
    excludedResidentId,
    tx
  );

  if (occupant) {
    throw new AppError(
      "BED_OCCUPIED",
      "A cama selecionada já está atribuída a outro utente.",
      409
    );
  }
}

export const residentService = {
  async findAll(scope: ResidentScope) {
    return residentRepository.findAll(scope);
  },

  async getById(id: string, scope: ResidentScope) {
    const resident = await residentRepository.findById(id, scope);

    if (!resident) {
      throw new AppError(
        "RESIDENT_NOT_FOUND",
        "Utente não encontrado.",
        404
      );
    }

    return resident;
  },

  async create(scope: ResidentScope, data: ResidentInput) {
    const validated = normalizeLocation(residentSchema.parse(data));

    return residentRepository.transaction(async (tx) => {
      await validateLocation(
        scope,
        validated,
        undefined,
        undefined,
        tx
      );

      const resident = await residentRepository.create(
        scope,
        validated,
        tx
      );

      if (resident.bedId) {
        await residentRepository.syncBedOccupancy(
          resident.bedId,
          scope,
          tx
        );
      }

      return resident;
    });
  },

  async update(
    id: string,
    scope: ResidentScope,
    data: UpdateResidentInput
  ) {
    const validated = updateResidentSchema.parse(data);

    return residentRepository.transaction(async (tx) => {
      const current = await residentRepository.findById(id, scope, tx);

      if (!current) {
        throw new AppError(
          "RESIDENT_NOT_FOUND",
          "Utente não encontrado.",
          404
        );
      }

      const next = normalizeLocation(
        residentSchema.parse({
          facilityId: current.facilityId,
          roomId: current.roomId,
          bedId: current.bedId,
          firstName: current.firstName,
          lastName: current.lastName,
          birthDate: current.birthDate,
          gender: current.gender,
          admissionDate: current.admissionDate,
          status: current.status,
          ...validated,
        })
      );

      await validateLocation(scope, next, id, current.bedId, tx);

      const resident = await residentRepository.update(id, scope, next, tx);

      if (!resident) {
        throw new AppError(
          "RESIDENT_NOT_FOUND",
          "Utente não encontrado.",
          404
        );
      }

      if (current.bedId) {
        await residentRepository.syncBedOccupancy(
          current.bedId,
          scope,
          tx
        );
      }

      if (next.bedId && next.bedId !== current.bedId) {
        await residentRepository.syncBedOccupancy(next.bedId, scope, tx);
      }

      return resident;
    });
  },

  async delete(id: string, scope: ResidentScope) {
    return residentRepository.transaction(async (tx) => {
      const resident = await residentRepository.findById(id, scope, tx);

      if (!resident) {
        throw new AppError(
          "RESIDENT_NOT_FOUND",
          "Utente não encontrado.",
          404
        );
      }

      const deleted = await residentRepository.delete(id, scope, tx);

      if (!deleted) {
        throw new AppError(
          "RESIDENT_NOT_FOUND",
          "Utente não encontrado.",
          404
        );
      }

      if (resident.bedId) {
        await residentRepository.syncBedOccupancy(
          resident.bedId,
          scope,
          tx
        );
      }

      return resident;
    });
  },
};
