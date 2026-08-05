import { Gender, ResidentStatus } from "@prisma/client";
import { z } from "zod";

const emptyStringToNull = (value: unknown) =>
  value === "" ? null : value;

const optionalIdSchema = z
  .preprocess(
    emptyStringToNull,
    z.string().min(1).nullable()
  )
  .default(null);

const optionalDateSchema = z
  .preprocess(
    emptyStringToNull,
    z.coerce
      .date({ error: "Indique uma data válida." })
      .nullable()
  )
  .default(null);

const optionalGenderSchema = z
  .preprocess(
    emptyStringToNull,
    z
      .nativeEnum(Gender, { error: "Selecione um género válido." })
      .nullable()
  )
  .default(null);

const residentBaseSchema = z.object({
  facilityId: z.string().min(1, "Deve selecionar um lar."),
  roomId: optionalIdSchema,
  bedId: optionalIdSchema,
  firstName: z
    .string()
    .trim()
    .min(1, "O nome do utente é obrigatório."),
  lastName: z
    .string()
    .trim()
    .min(1, "O apelido do utente é obrigatório."),
  birthDate: optionalDateSchema,
  gender: optionalGenderSchema,
  admissionDate: optionalDateSchema,
  status: z
    .nativeEnum(ResidentStatus, { error: "Selecione um estado válido." })
    .default(ResidentStatus.ACTIVE),
});

export const residentSchema = residentBaseSchema.superRefine(
  (data, context) => {
    if (data.bedId && !data.roomId) {
      context.addIssue({
        code: "custom",
        message: "Deve selecionar um quarto para atribuir uma cama.",
        path: ["roomId"],
      });
    }
  }
);

export const updateResidentSchema = residentBaseSchema.partial();

export type ResidentInput = z.infer<typeof residentSchema>;
export type UpdateResidentInput = z.infer<typeof updateResidentSchema>;
