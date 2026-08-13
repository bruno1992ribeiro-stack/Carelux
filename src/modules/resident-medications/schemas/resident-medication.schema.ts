import {
  MedicationCareMoment,
  MedicationScheduleMode,
  MedicationWeekday,
} from "@prisma/client";
import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.date().nullable(),
);

const optionalUserId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.string().uuid("Prescritor interno inválido.").nullable(),
);

const positiveInteger = (message: string) =>
  z.coerce.number().int(message).positive(message);

const optionalPositiveInteger = (message: string) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    positiveInteger(message).nullable(),
  );

const weekdaysSchema = z.array(z.enum(MedicationWeekday)).default([]);
const timeOfDaySchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Indique uma hora válida no formato HH:mm.");

const fixedTimeOccurrenceSchema = z
  .object({
    timeOfDay: timeOfDaySchema,
    doseOverride: optionalText,
  })
  .strict();

const careMomentOccurrenceSchema = z
  .object({
    careMoment: z.enum(MedicationCareMoment),
    doseOverride: optionalText,
  })
  .strict();

const dailyFrequencyScheduleSchema = z
  .object({
    mode: z.literal(MedicationScheduleMode.DAILY_FREQUENCY),
    timesPerDay: positiveInteger("Indique um número de tomas diário válido."),
    weekdays: weekdaysSchema,
    instructions: optionalText,
  })
  .strict();

const fixedTimesScheduleSchema = z
  .object({
    mode: z.literal(MedicationScheduleMode.FIXED_TIMES),
    weekdays: weekdaysSchema,
    instructions: optionalText,
    occurrences: z
      .array(fixedTimeOccurrenceSchema)
      .min(1, "Indique pelo menos uma hora de toma."),
  })
  .strict()
  .superRefine((value, context) => {
    const seenTimes = new Set<string>();

    value.occurrences.forEach((occurrence, index) => {
      if (seenTimes.has(occurrence.timeOfDay)) {
        context.addIssue({
          code: "custom",
          message: "A mesma hora não pode ser repetida.",
          path: ["occurrences", index, "timeOfDay"],
        });
      }

      seenTimes.add(occurrence.timeOfDay);
    });
  });

const careMomentsScheduleSchema = z
  .object({
    mode: z.literal(MedicationScheduleMode.CARE_MOMENTS),
    weekdays: weekdaysSchema,
    instructions: optionalText,
    occurrences: z
      .array(careMomentOccurrenceSchema)
      .min(1, "Indique pelo menos um momento de toma."),
  })
  .strict()
  .superRefine((value, context) => {
    const seenMoments = new Set<MedicationCareMoment>();

    value.occurrences.forEach((occurrence, index) => {
      if (seenMoments.has(occurrence.careMoment)) {
        context.addIssue({
          code: "custom",
          message: "O mesmo momento de toma não pode ser repetido.",
          path: ["occurrences", index, "careMoment"],
        });
      }

      seenMoments.add(occurrence.careMoment);
    });
  });

const intervalScheduleSchema = z
  .object({
    mode: z.literal(MedicationScheduleMode.INTERVAL),
    intervalHours: positiveInteger("Indique um intervalo de horas válido."),
    weekdays: weekdaysSchema,
    instructions: optionalText,
  })
  .strict();

const prnScheduleSchema = z
  .object({
    mode: z.literal(MedicationScheduleMode.PRN),
    prnReason: z.string().trim().min(1, "Indique o motivo da toma SOS."),
    maxDosesPerDay: optionalPositiveInteger(
      "Indique um número máximo de tomas diário válido.",
    ),
    minimumIntervalHours: optionalPositiveInteger(
      "Indique um intervalo mínimo de horas válido.",
    ),
    weekdays: weekdaysSchema,
    instructions: optionalText,
  })
  .strict();

export const medicationIdSchema = z.string().uuid("Medicação inválida.");
export const medicationResidentIdSchema = z.string().uuid("Utente inválido.");

export const medicationScheduleSchema = z.discriminatedUnion("mode", [
  dailyFrequencyScheduleSchema,
  fixedTimesScheduleSchema,
  careMomentsScheduleSchema,
  intervalScheduleSchema,
  prnScheduleSchema,
]);

const medicationFields = {
  prescriberUserId: optionalUserId,
  prescriberName: z.string().trim().min(1, "Indique o prescritor."),
  medicationName: z.string().trim().min(1, "Indique o medicamento."),
  dosage: z.string().trim().min(1, "Indique a dosagem."),
  pharmaceuticalForm: z.string().trim().min(1, "Indique a forma farmacêutica."),
  administrationRoute: z.string().trim().min(1, "Indique a via de administração."),
  indication: optionalText,
  observations: optionalText,
  startDate: z.coerce.date(),
  endDate: optionalDate,
};

function validateDateRange(
  value: { startDate: Date; endDate: Date | null },
  context: z.RefinementCtx,
) {
  if (value.endDate && value.endDate < value.startDate) {
    context.addIssue({
      code: "custom",
      message: "A data de fim não pode ser anterior à data de início.",
      path: ["endDate"],
    });
  }
}

export const medicationCreateSchema = z
  .object({
    ...medicationFields,
    schedule: medicationScheduleSchema,
  })
  .strict()
  .superRefine(validateDateRange);

export const medicationEditSchema = z
  .object(medicationFields)
  .strict()
  .superRefine(validateDateRange);

export const medicationScheduleChangeSchema = z
  .object({
    medicationId: medicationIdSchema,
    schedule: medicationScheduleSchema,
    reason: z
      .string()
      .trim()
      .min(1, "Indique o motivo da alteração do esquema posológico."),
  })
  .strict();

export const medicationSuspendSchema = z
  .object({
    medicationId: medicationIdSchema,
    reason: z.string().trim().min(1, "Indique o motivo da suspensão."),
  })
  .strict();

export const medicationReactivateSchema = z
  .object({
    medicationId: medicationIdSchema,
    reason: z.string().trim().min(1, "Indique o motivo da reativação."),
  })
  .strict();

export const medicationDiscontinueSchema = z
  .object({
    medicationId: medicationIdSchema,
    reason: z.string().trim().min(1, "Indique o motivo da descontinuação."),
  })
  .strict();

export type MedicationCreateInput = z.infer<typeof medicationCreateSchema>;
export type MedicationEditInput = z.infer<typeof medicationEditSchema>;
export type MedicationScheduleInput = z.infer<typeof medicationScheduleSchema>;
export type MedicationScheduleChangeInput = z.infer<
  typeof medicationScheduleChangeSchema
>;
export type MedicationSuspendInput = z.infer<typeof medicationSuspendSchema>;
export type MedicationReactivateInput = z.infer<typeof medicationReactivateSchema>;
export type MedicationDiscontinueInput = z.infer<typeof medicationDiscontinueSchema>;
