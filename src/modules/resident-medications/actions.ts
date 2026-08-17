"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";

import {
  medicationCreateSchema,
  medicationDiscontinueSchema,
  medicationEditSchema,
  medicationIdSchema,
  medicationReactivateSchema,
  medicationResidentIdSchema,
  medicationScheduleChangeSchema,
  medicationSuspendSchema,
} from "./schemas/resident-medication.schema";
import { getMedicationEditAuthorization } from "./server/medication-authorization";
import { residentMedicationService } from "./services/resident-medication.service";

export type MedicationActionState = {
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

function structuredValue(formData: FormData, name: string): unknown {
  const rawValue = formData.get(name);

  if (typeof rawValue !== "string") {
    return rawValue;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    return rawValue;
  }
}

function medicationInput(formData: FormData) {
  return {
    prescriberUserId: optionalValue(formData, "prescriberUserId"),
    prescriberName: value(formData, "prescriberName"),
    medicationName: value(formData, "medicationName"),
    dosage: value(formData, "dosage"),
    pharmaceuticalForm: value(formData, "pharmaceuticalForm"),
    administrationRoute: value(formData, "administrationRoute"),
    indication: optionalValue(formData, "indication"),
    observations: optionalValue(formData, "observations"),
    startDate: value(formData, "startDate"),
    endDate: optionalValue(formData, "endDate"),
  };
}

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Boolean(entry[1]),
    ),
  );
}

function errorState(error: unknown): MedicationActionState {
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

  return {
    success: false,
    message: "Não foi possível concluir a operação.",
  };
}

function revalidateResidentMedication(residentId: string) {
  revalidatePath(`/dashboard/residents/${residentId}/medication`);
}

async function execute(
  residentId: string,
  operation: (validatedResidentId: string) => Promise<unknown>,
  successMessage: string,
): Promise<MedicationActionState> {
  try {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    await operation(validatedResidentId);
    revalidateResidentMedication(validatedResidentId);
    return { success: true, message: successMessage };
  } catch (error) {
    return errorState(error);
  }
}

export async function createMedication(
  residentId: string,
  _state: MedicationActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = medicationCreateSchema.parse({
        ...medicationInput(formData),
        schedule: structuredValue(formData, "schedule"),
      });
      const { user, scope } = await getMedicationEditAuthorization();
      await residentMedicationService.createMedication(
        validatedResidentId,
        scope,
        user.id,
        input,
      );
    },
    "Medicação criada com sucesso.",
  );
}

export async function editMedication(
  residentId: string,
  medicationId: string,
  _state: MedicationActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const validatedMedicationId = medicationIdSchema.parse(medicationId);
      const input = medicationEditSchema.parse(medicationInput(formData));
      const { user, scope } = await getMedicationEditAuthorization();
      await residentMedicationService.editMedication(
        validatedResidentId,
        validatedMedicationId,
        scope,
        user.id,
        input,
      );
    },
    "Medicação atualizada com sucesso.",
  );
}

export async function changeMedicationSchedule(
  residentId: string,
  _state: MedicationActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = medicationScheduleChangeSchema.parse({
        medicationId: value(formData, "medicationId"),
        schedule: structuredValue(formData, "schedule"),
        reason: value(formData, "reason"),
      });
      const { user, scope } = await getMedicationEditAuthorization();
      await residentMedicationService.changeMedicationSchedule(
        validatedResidentId,
        scope,
        user.id,
        input,
      );
    },
    "Esquema posológico atualizado com sucesso.",
  );
}

export async function suspendMedication(
  residentId: string,
  _state: MedicationActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = medicationSuspendSchema.parse({
        medicationId: value(formData, "medicationId"),
        reason: value(formData, "reason"),
      });
      const { user, scope } = await getMedicationEditAuthorization();
      await residentMedicationService.suspendMedication(
        validatedResidentId,
        scope,
        user.id,
        input,
      );
    },
    "Medicação suspensa com sucesso.",
  );
}

export async function reactivateMedication(
  residentId: string,
  _state: MedicationActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = medicationReactivateSchema.parse({
        medicationId: value(formData, "medicationId"),
        reason: value(formData, "reason"),
      });
      const { user, scope } = await getMedicationEditAuthorization();
      await residentMedicationService.reactivateMedication(
        validatedResidentId,
        scope,
        user.id,
        input,
      );
    },
    "Medicação reativada com sucesso.",
  );
}

export async function discontinueMedication(
  residentId: string,
  _state: MedicationActionState,
  formData: FormData,
) {
  void _state;
  return execute(
    residentId,
    async (validatedResidentId) => {
      const input = medicationDiscontinueSchema.parse({
        medicationId: value(formData, "medicationId"),
        reason: value(formData, "reason"),
      });
      const { user, scope } = await getMedicationEditAuthorization();
      await residentMedicationService.discontinueMedication(
        validatedResidentId,
        scope,
        user.id,
        input,
      );
    },
    "Medicação descontinuada com sucesso.",
  );
}
