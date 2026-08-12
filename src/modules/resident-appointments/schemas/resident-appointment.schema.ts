import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

const optionalUserId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.string().uuid("Profissional interno inválido.").nullable(),
);

export const appointmentIdSchema = z.string().uuid("Consulta inválida.");
export const appointmentResidentIdSchema = z.string().uuid("Utente inválido.");

export const appointmentCreateSchema = z.object({
  professionalName: z.string().trim().min(1, "Indique o profissional responsável."),
  responsibleUserId: optionalUserId,
  scheduledAt: z.coerce.date(),
  type: z.string().trim().min(1, "Indique o tipo de consulta."),
  specialty: optionalText,
  location: optionalText,
  reason: optionalText,
  observations: optionalText,
});

export const appointmentEditSchema = appointmentCreateSchema.omit({ scheduledAt: true });

export const appointmentRescheduleSchema = z.object({
  appointmentId: appointmentIdSchema,
  scheduledAt: z.coerce.date(),
  changeReason: optionalText,
});

export const appointmentCompleteSchema = z.object({
  appointmentId: appointmentIdSchema,
});

export const appointmentCancelSchema = z.object({
  appointmentId: appointmentIdSchema,
  cancellationReason: z.string().trim().min(1, "Indique o motivo do cancelamento."),
});

export const appointmentReopenSchema = z.object({
  appointmentId: appointmentIdSchema,
  changeReason: z.string().trim().min(1, "Indique o motivo da reabertura."),
});

export const appointmentStatusCorrectionSchema = z
  .object({
    appointmentId: appointmentIdSchema,
    targetStatus: z.enum([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]),
    changeReason: z.string().trim().min(1, "Indique o motivo da correção."),
    cancellationReason: optionalText,
  })
  .superRefine((value, context) => {
    if (value.targetStatus === AppointmentStatus.CANCELLED && !value.cancellationReason) {
      context.addIssue({
        code: "custom",
        message: "Indique o motivo do cancelamento.",
        path: ["cancellationReason"],
      });
    }
  });

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentEditInput = z.infer<typeof appointmentEditSchema>;
export type AppointmentRescheduleInput = z.infer<typeof appointmentRescheduleSchema>;
export type AppointmentCancelInput = z.infer<typeof appointmentCancelSchema>;
export type AppointmentReopenInput = z.infer<typeof appointmentReopenSchema>;
export type AppointmentStatusCorrectionInput = z.infer<typeof appointmentStatusCorrectionSchema>;
