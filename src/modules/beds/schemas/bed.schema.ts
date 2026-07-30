import { z } from "zod";

export const bedSchema = z.object({
  roomId: z
    .string()
    .min(1, "Deve selecionar um quarto."),

  identifier: z
    .string()
    .trim()
    .min(1, "O identificador da cama é obrigatório."),

  active: z.boolean(),

  occupied: z.boolean(),
});

export type BedInput = z.infer<typeof bedSchema>;