import { AppError } from "@/lib/errors/app-error";

import { bedRepository } from "../repository/bed.repository";
import {
  bedSchema,
  type BedInput,
} from "../schemas/bed.schema";

export const bedService = {
  async findAll(clientId: string) {
    return bedRepository.findAll(clientId);
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

    const room =
      await bedRepository.findRoomById(
        validated.roomId,
        clientId
      );

    if (!room) {
      throw new AppError(
        "ROOM_NOT_FOUND",
        "O quarto selecionado não pertence ao cliente autenticado.",
        404
      );
    }

    const duplicate =
      await bedRepository.findDuplicate(
        validated.roomId,
        validated.identifier
      );

    if (duplicate) {
      throw new AppError(
        "BED_ALREADY_EXISTS",
        "Já existe uma cama com este identificador neste quarto.",
        409
      );
    }

    return bedRepository.create(validated);
  },

  async update(
    id: string,
    clientId: string,
    data: BedInput
  ) {
    const currentBed =
      await bedRepository.findById(
        id,
        clientId
      );

    if (!currentBed) {
      throw new AppError(
        "BED_NOT_FOUND",
        "Cama não encontrada.",
        404
      );
    }

    const validated = bedSchema.parse(data);

    const room =
      await bedRepository.findRoomById(
        validated.roomId,
        clientId
      );

    if (!room) {
      throw new AppError(
        "ROOM_NOT_FOUND",
        "O quarto selecionado não pertence ao cliente autenticado.",
        404
      );
    }

    const duplicate =
      await bedRepository.findDuplicate(
        validated.roomId,
        validated.identifier,
        id
      );

    if (duplicate) {
      throw new AppError(
        "BED_ALREADY_EXISTS",
        "Já existe uma cama com este identificador neste quarto.",
        409
      );
    }

    return bedRepository.update(
      id,
      validated
    );
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