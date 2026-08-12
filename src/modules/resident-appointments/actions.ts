"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { Permission } from "@/modules/authorization/permissions";

import {
  appointmentCancelSchema,
  appointmentCompleteSchema,
  appointmentCreateSchema,
  appointmentEditSchema,
  appointmentIdSchema,
  appointmentResidentIdSchema,
  appointmentRescheduleSchema,
  appointmentReopenSchema,
  appointmentStatusCorrectionSchema,
} from "./schemas/resident-appointment.schema";
import { getAppointmentAuthorization } from "./server/appointment-authorization";
import { residentAppointmentService } from "./services/resident-appointment.service";

export type AppointmentActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function optionalValue(formData: FormData, name: string) {
  const result = value(formData, name).trim();
  return result || null;
}

function appointmentInput(formData: FormData) {
  return {
    professionalName: value(formData, "professionalName"),
    responsibleUserId: optionalValue(formData, "responsibleUserId"),
    scheduledAt: value(formData, "scheduledAt"),
    type: value(formData, "type"),
    specialty: optionalValue(formData, "specialty"),
    location: optionalValue(formData, "location"),
    reason: optionalValue(formData, "reason"),
    observations: optionalValue(formData, "observations"),
  };
}

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Boolean(entry[1]),
    ),
  );
}

function errorState(error: unknown): AppointmentActionState {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      message: "Verifique os campos indicados.",
      errors: fieldErrors(error),
    };
  }

  if (error instanceof AppError) {
    return { success: false, message: error.message };
  }

  return { success: false, message: "Não foi possível concluir a operação." };
}

function revalidateAppointments(residentId: string) {
  revalidatePath(`/dashboard/residents/${residentId}/appointments`);
}

async function execute(
  residentId: string,
  operation: (validatedResidentId: string) => Promise<unknown>,
  successMessage: string,
): Promise<AppointmentActionState> {
  try {
    const validatedResidentId = appointmentResidentIdSchema.parse(residentId);
    await operation(validatedResidentId);
    revalidateAppointments(validatedResidentId);
    return { success: true, message: successMessage };
  } catch (error) {
    return errorState(error);
  }
}

async function editAuthorization() {
  return getAppointmentAuthorization(Permission.EDIT_APPOINTMENT);
}

export async function createAppointment(
  residentId: string,
  _state: AppointmentActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = appointmentCreateSchema.parse(appointmentInput(formData));
      const { user, scope } = await editAuthorization();
      await residentAppointmentService.create(validatedResidentId, scope, user.id, input);
    },
    "Consulta criada com sucesso.",
  );
}

export async function editAppointment(
  residentId: string,
  appointmentId: string,
  _state: AppointmentActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const validatedAppointmentId = appointmentIdSchema.parse(appointmentId);
      const { scheduledAt: _scheduledAt, ...editableInput } = appointmentInput(formData);
      void _scheduledAt;
      const input = appointmentEditSchema.parse(editableInput);
      const { user, scope } = await editAuthorization();
      await residentAppointmentService.edit(
        validatedResidentId,
        validatedAppointmentId,
        scope,
        user.id,
        input,
      );
    },
    "Consulta atualizada com sucesso.",
  );
}

export async function rescheduleAppointment(
  residentId: string,
  _state: AppointmentActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = appointmentRescheduleSchema.parse({
        appointmentId: value(formData, "appointmentId"),
        scheduledAt: value(formData, "scheduledAt"),
        changeReason: optionalValue(formData, "changeReason"),
      });
      const { user, scope } = await editAuthorization();
      await residentAppointmentService.reschedule(validatedResidentId, scope, user.id, input);
    },
    "Consulta reagendada com sucesso.",
  );
}

export async function completeAppointment(
  residentId: string,
  appointmentId: string,
  _state: AppointmentActionState,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = appointmentCompleteSchema.parse({ appointmentId });
      const { user, scope } = await editAuthorization();
      await residentAppointmentService.complete(
        validatedResidentId,
        input.appointmentId,
        scope,
        user.id,
      );
    },
    "Consulta marcada como realizada.",
  );
}

export async function cancelAppointment(
  residentId: string,
  _state: AppointmentActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = appointmentCancelSchema.parse({
        appointmentId: value(formData, "appointmentId"),
        cancellationReason: value(formData, "cancellationReason"),
      });
      const { user, scope } = await editAuthorization();
      await residentAppointmentService.cancel(validatedResidentId, scope, user.id, input);
    },
    "Consulta cancelada com sucesso.",
  );
}

export async function reopenAppointment(
  residentId: string,
  _state: AppointmentActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = appointmentReopenSchema.parse({
        appointmentId: value(formData, "appointmentId"),
        changeReason: value(formData, "changeReason"),
      });
      const { user, scope } = await editAuthorization();
      await residentAppointmentService.reopen(validatedResidentId, scope, user.id, input);
    },
    "Consulta reaberta com sucesso.",
  );
}

export async function correctAppointmentStatus(
  residentId: string,
  _state: AppointmentActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = appointmentStatusCorrectionSchema.parse({
        appointmentId: value(formData, "appointmentId"),
        targetStatus: value(formData, "targetStatus"),
        changeReason: value(formData, "changeReason"),
        cancellationReason: optionalValue(formData, "cancellationReason"),
      });
      const { user, scope } = await editAuthorization();
      await residentAppointmentService.correctStatus(
        validatedResidentId,
        scope,
        user.id,
        input,
      );
    },
    "Estado da consulta corrigido com sucesso.",
  );
}
