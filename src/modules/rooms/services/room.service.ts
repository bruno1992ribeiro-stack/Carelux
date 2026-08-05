import { AppError } from "@/lib/errors/app-error";

import { roomRepository } from "../repository/room.repository";
import {
  roomSchema,
  type RoomInput,
} from "../schemas/room.schema";

export const roomService = {
  async findAll(clientId: string) {
    return roomRepository.findAll(clientId);
  },

  async getById(
    id: string,
    clientId: string
  ) {
    const room =
      await roomRepository.findById(
        id,
        clientId
      );

    if (!room) {
      throw new AppError(
        "ROOM_NOT_FOUND",
        "Quarto não encontrado.",
        404
      );
    }

    return room;
  },

  async create(
    clientId: string,
    data: RoomInput
  ) {
    const validated =
      roomSchema.parse(data);

    const facility =
      await roomRepository.findFacilityById(
        validated.facilityId,
        clientId
      );

    if (!facility) {
      throw new AppError(
        "FACILITY_NOT_FOUND",
        "O lar selecionado não pertence ao cliente autenticado.",
        404
      );
    }

    return roomRepository.create(validated);
  },

  async update(
    id: string,
    clientId: string,
    data: Partial<RoomInput>
  ) {
    const room =
      await roomRepository.findById(
        id,
        clientId
      );

    if (!room) {
      throw new AppError(
        "ROOM_NOT_FOUND",
        "Quarto não encontrado.",
        404
      );
    }

    const validated =
      roomSchema.partial().parse(data);

    if (validated.facilityId) {
      const facility =
        await roomRepository.findFacilityById(
          validated.facilityId,
          clientId
        );

      if (!facility) {
        throw new AppError(
          "FACILITY_NOT_FOUND",
          "O lar selecionado não pertence ao cliente autenticado.",
          404
        );
      }
    }

    return roomRepository.update(
      id,
      validated
    );
  },

  async delete(
    id: string,
    clientId: string
  ) {
    const room =
      await roomRepository.findById(
        id,
        clientId
      );

    if (!room) {
      throw new AppError(
        "ROOM_NOT_FOUND",
        "Quarto não encontrado.",
        404
      );
    }

    return roomRepository.delete(id);
  },
};
