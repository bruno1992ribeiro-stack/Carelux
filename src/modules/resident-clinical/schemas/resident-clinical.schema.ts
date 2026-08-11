import { AllergySeverity, AllergyType, ClinicalRecordCategory } from "@prisma/client";
import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().min(1).nullable().optional(),
);
const optionalDate = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.date().nullable(),
);

export const diagnosisSchema = z.object({
  name: z.string().trim().min(1, "Indique o diagnóstico."),
  description: optionalText,
  diagnosedAt: optionalDate,
  observations: optionalText,
});
export const diagnosisCorrectionSchema = diagnosisSchema.extend({ supersedesId: z.string().uuid("Diagnóstico inválido.") });

export const allergySchema = z.object({
  allergen: z.string().trim().min(1, "Indique o alergénio."),
  type: z.preprocess((value) => (value === "" || value === undefined ? null : value), z.enum(AllergyType).nullable()),
  reaction: z.string().trim().min(1, "Indique a reação."),
  severity: z.enum(AllergySeverity),
  observations: optionalText,
});
export const allergyCorrectionSchema = allergySchema.extend({ supersedesId: z.string().uuid("Alergia inválida.") });

export const clinicalRecordSchema = z.object({
  category: z.enum(ClinicalRecordCategory),
  title: z.string().trim().min(1, "Indique o título."),
  content: z.string().trim().min(1, "Indique o conteúdo clínico."),
  clinicalAt: z.coerce.date(),
});
export const clinicalRecordAmendmentSchema = clinicalRecordSchema.extend({ amendsRecordId: z.string().uuid("Registo clínico inválido.") });
export const clinicalRecordVoidSchema = z.object({
  recordId: z.string().uuid("Registo clínico inválido."),
  voidReason: z.string().trim().min(1, "Indique o motivo da anulação."),
});

export type DiagnosisInput = z.infer<typeof diagnosisSchema>;
export type DiagnosisCorrectionInput = z.infer<typeof diagnosisCorrectionSchema>;
export type AllergyInput = z.infer<typeof allergySchema>;
export type AllergyCorrectionInput = z.infer<typeof allergyCorrectionSchema>;
export type ClinicalRecordInput = z.infer<typeof clinicalRecordSchema>;
export type ClinicalRecordAmendmentInput = z.infer<typeof clinicalRecordAmendmentSchema>;
export type ClinicalRecordVoidInput = z.infer<typeof clinicalRecordVoidSchema>;
