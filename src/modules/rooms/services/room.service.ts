import { AppError } from "@/lib/errors/app-error";
import { FacilityStatus } from "@prisma/client";

import { roomRepository } from "../repository/room.repository";
import {
  roomSchema,
  type RoomInput,
} from "../schemas/room.schema";

export const roomService = {
  async findAll(clientId: string, facilityId?: string) {
    return roomRepository.findAll(clientId, facilityId);
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

    return roomRepository.transaction(async (tx) => {
      const facility = await roomRepository.findFacilityById(
        validated.facilityId,
        clientId,
        tx
      );

      if (!facility) {
        throw new AppError(
          "FACILITY_NOT_FOUND",
          "A unidade selecionada não pertence ao cliente autenticado.",
          404
        );
      }

      if (facility.status !== FacilityStatus.ACTIVE) {
        throw new AppError(
          "FACILITY_INACTIVE",
          "Não é possível criar quartos numa unidade inativa.",
          409
        );
      }

      return roomRepository.create(validated, tx);
    });
  },

  async update(
    id: string,
    clientId: string,
    data: Partial<RoomInput>
  ) {
    const validated =
      roomSchema.partial().parse(data);

    return roomRepository.transaction(async (tx) => {
      const room = await roomRepository.findById(id, clientId, tx);

      if (!room) {
        throw new AppError(
          "ROOM_NOT_FOUND",
          "Quarto não encontrado.",
          404
        );
      }

      if (validated.facilityId && validated.facilityId !== room.facilityId) {
        const destination = await roomRepository.findFacilityById(
          validated.facilityId,
          clientId,
          tx
        );

        if (!destination) {
          throw new AppError(
            "FACILITY_NOT_FOUND",
            "A unidade selecionada não pertence ao cliente autenticado.",
            404
          );
        }

        if (destination.status !== FacilityStatus.ACTIVE) {
          throw new AppError(
            "FACILITY_INACTIVE",
            "Não é possível transferir o quarto para uma unidade inativa.",
            409
          );
        }
      }

      return roomRepository.update(id, validated, tx);
    });
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
