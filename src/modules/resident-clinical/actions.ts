"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { Permission } from "@/modules/authorization/permissions";

import {
  allergyCorrectionSchema,
  allergySchema,
  clinicalRecordAmendmentSchema,
  clinicalRecordSchema,
  clinicalRecordVoidSchema,
  diagnosisCorrectionSchema,
  diagnosisSchema,
} from "./schemas/resident-clinical.schema";
import { getClinicalAuthorization } from "./server/clinical-authorization";
import { residentClinicalService } from "./services/resident-clinical.service";

export type ClinicalActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const idSchema = z.string().uuid("Identificador inválido.");

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => Boolean(entry[1]),
    ),
  );
}

function errorState(error: unknown): ClinicalActionState {
  if (error instanceof z.ZodError) {
    return { success: false, message: "Verifique os campos indicados.", errors: fieldErrors(error) };
  }
  if (error instanceof AppError) return { success: false, message: error.message };
  return { success: false, message: "Não foi possível concluir a operação clínica." };
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function optionalValue(formData: FormData, name: string) {
  const result = value(formData, name).trim();
  return result || null;
}

function diagnosisInput(formData: FormData) {
  return { name: value(formData, "name"), description: optionalValue(formData, "description"), diagnosedAt: optionalValue(formData, "diagnosedAt"), observations: optionalValue(formData, "observations") };
}

function allergyInput(formData: FormData) {
  return { allergen: value(formData, "allergen"), type: optionalValue(formData, "type"), reaction: value(formData, "reaction"), severity: value(formData, "severity"), observations: optionalValue(formData, "observations") };
}

function clinicalRecordInput(formData: FormData) {
  return { category: value(formData, "category"), title: value(formData, "title"), content: value(formData, "content"), clinicalAt: value(formData, "clinicalAt") };
}

function revalidateResidentHealth(residentId: string) {
  revalidatePath(`/dashboard/residents/${residentId}/health`);
}

async function execute(residentId: string, operation: () => Promise<unknown>, successMessage: string): Promise<ClinicalActionState> {
  try {
    idSchema.parse(residentId);
    await operation();
    revalidateResidentHealth(residentId);
    return { success: true, message: successMessage };
  } catch (error) {
    return errorState(error);
  }
}

export async function createDiagnosis(residentId: string, _state: ClinicalActionState, formData: FormData) {
  void _state;
  return execute(residentId, async () => {
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_PATHOLOGY);
    await residentClinicalService.createDiagnosis(residentId, scope, user.id, diagnosisSchema.parse(diagnosisInput(formData)));
  }, "Diagnóstico registado com sucesso.");
}

export async function correctDiagnosis(residentId: string, _state: ClinicalActionState, formData: FormData) {
  void _state;
  return execute(residentId, async () => {
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_PATHOLOGY);
    const input = diagnosisCorrectionSchema.parse({ ...diagnosisInput(formData), supersedesId: value(formData, "supersedesId") });
    await residentClinicalService.correctDiagnosis(residentId, scope, user.id, input);
  }, "Correção do diagnóstico registada com sucesso.");
}

export async function deactivateDiagnosis(residentId: string, diagnosisId: string, _state: ClinicalActionState) {
  void _state;
  return execute(residentId, async () => {
    const validatedId = idSchema.parse(diagnosisId);
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_PATHOLOGY);
    await residentClinicalService.deactivateDiagnosis(residentId, validatedId, scope, user.id);
  }, "Diagnóstico desativado com sucesso.");
}

export async function createAllergy(residentId: string, _state: ClinicalActionState, formData: FormData) {
  void _state;
  return execute(residentId, async () => {
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_ALLERGY);
    await residentClinicalService.createAllergy(residentId, scope, user.id, allergySchema.parse(allergyInput(formData)));
  }, "Alergia registada com sucesso.");
}

export async function correctAllergy(residentId: string, _state: ClinicalActionState, formData: FormData) {
  void _state;
  return execute(residentId, async () => {
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_ALLERGY);
    const input = allergyCorrectionSchema.parse({ ...allergyInput(formData), supersedesId: value(formData, "supersedesId") });
    await residentClinicalService.correctAllergy(residentId, scope, user.id, input);
  }, "Correção da alergia registada com sucesso.");
}

export async function deactivateAllergy(residentId: string, allergyId: string, _state: ClinicalActionState) {
  void _state;
  return execute(residentId, async () => {
    const validatedId = idSchema.parse(allergyId);
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_ALLERGY);
    await residentClinicalService.deactivateAllergy(residentId, validatedId, scope, user.id);
  }, "Alergia desativada com sucesso.");
}

export async function createClinicalRecord(residentId: string, _state: ClinicalActionState, formData: FormData) {
  void _state;
  return execute(residentId, async () => {
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_CLINICAL_RECORD);
    await residentClinicalService.createClinicalRecord(residentId, scope, user.id, clinicalRecordSchema.parse(clinicalRecordInput(formData)));
  }, "Registo clínico criado com sucesso.");
}

export async function amendClinicalRecord(residentId: string, _state: ClinicalActionState, formData: FormData) {
  void _state;
  return execute(residentId, async () => {
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_CLINICAL_RECORD);
    const input = clinicalRecordAmendmentSchema.parse({ ...clinicalRecordInput(formData), amendsRecordId: value(formData, "amendsRecordId") });
    await residentClinicalService.amendClinicalRecord(residentId, scope, user.id, input);
  }, "Correção do registo clínico criada com sucesso.");
}

export async function voidClinicalRecord(residentId: string, _state: ClinicalActionState, formData: FormData) {
  void _state;
  return execute(residentId, async () => {
    const { user, scope } = await getClinicalAuthorization(Permission.EDIT_CLINICAL_RECORD);
    const input = clinicalRecordVoidSchema.parse({ recordId: value(formData, "recordId"), voidReason: value(formData, "voidReason") });
    await residentClinicalService.voidClinicalRecord(residentId, scope, user.id, input);
  }, "Registo clínico anulado com sucesso.");
}
