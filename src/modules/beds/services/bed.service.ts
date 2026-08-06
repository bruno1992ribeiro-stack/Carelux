import { AppError } from "@/lib/errors/app-error";
import { FacilityStatus } from "@prisma/client";

import { bedRepository } from "../repository/bed.repository";
import {
  bedSchema,
  type BedInput,
} from "../schemas/bed.schema";

export const bedService = {
  async findAll(clientId: string, facilityId?: string) {
    return bedRepository.findAll(clientId, facilityId);
  },

  async getById(
    id: string,
    clientId: string
  ) {
    const bed = await bedRepository.findById(
      id,
      clientId
    );

    if (!bed) {
      throw new AppError(
        "BED_NOT_FOUND",
        "Cama não encontrada.",
        404
      );
    }

    return bed;
  },

  async create(
    clientId: string,
    data: BedInput
  ) {
    const validated = bedSchema.parse(data);

    return bedRepository.transaction(async (tx) => {
      const room = await bedRepository.findRoomById(
        validated.roomId,
        clientId,
        tx
      );

      if (!room) {
        throw new AppError(
          "ROOM_NOT_FOUND",
          "O quarto selecionado não pertence ao cliente autenticado.",
          404
        );
      }

      if (room.facility.status !== FacilityStatus.ACTIVE) {
        throw new AppError(
          "FACILITY_INACTIVE",
          "Não é possível criar camas num lar inativo.",
          409
        );
      }

      const duplicate = await bedRepository.findDuplicate(
        validated.roomId,
        validated.identifier,
        undefined,
        tx
      );

      if (duplicate) {
        throw new AppError(
          "BED_ALREADY_EXISTS",
          "Já existe uma cama com este identificador neste quarto.",
          409
        );
      }

      return bedRepository.create(validated, tx);
    });
  },

  async update(
    id: string,
    clientId: string,
    data: BedInput
  ) {
    const validated = bedSchema.parse(data);

    return bedRepository.transaction(async (tx) => {
      const currentBed = await bedRepository.findById(id, clientId, tx);

      if (!currentBed) {
        throw new AppError(
          "BED_NOT_FOUND",
          "Cama não encontrada.",
          404
        );
      }

      const room = await bedRepository.findRoomById(
        validated.roomId,
        clientId,
        tx
      );

      if (!room) {
        throw new AppError(
          "ROOM_NOT_FOUND",
          "O quarto selecionado não pertence ao cliente autenticado.",
          404
        );
      }

      if (
        validated.roomId !== currentBed.roomId &&
        room.facility.status !== FacilityStatus.ACTIVE
      ) {
        throw new AppError(
          "FACILITY_INACTIVE",
          "Não é possível transferir a cama para um lar inativo.",
          409
        );
      }

      const duplicate = await bedRepository.findDuplicate(
        validated.roomId,
        validated.identifier,
        id,
        tx
      );

      if (duplicate) {
        throw new AppError(
          "BED_ALREADY_EXISTS",
          "Já existe uma cama com este identificador neste quarto.",
          409
        );
      }

      return bedRepository.update(id, validated, tx);
    });
  },

  async delete(
    id: string,
    clientId: string
  ) {
    const bed = await bedRepository.findById(
      id,
      clientId
    );

    if (!bed) {
      throw new AppError(
        "BED_NOT_FOUND",
        "Cama não encontrada.",
        404
      );
    }

    if (bed.occupied) {
      throw new AppError(
        "BED_OCCUPIED",
        "Não é possível eliminar uma cama ocupada.",
        409
      );
    }

    return bedRepository.delete(id);
  },
};
