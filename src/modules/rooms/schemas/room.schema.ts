import { z } from "zod";

export const roomSchema = z.object({
  facilityId: z.string().min(1, "Selecione um lar."),
  number: z.string().trim().min(1, "Indique o número do quarto."),
  floor: z.string().trim().optional(),
  capacity: z
    .number({
      error: "Indique a capacidade do quarto.",
    })
    .int("A capacidade deve ser um número inteiro.")
    .min(1, "A capacidade deve ser pelo menos 1."),
  description: z.string().trim().optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;
