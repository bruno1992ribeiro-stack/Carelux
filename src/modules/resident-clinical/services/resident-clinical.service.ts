import { AppError } from "@/lib/errors/app-error";
import type { ResidentScope } from "@/modules/residents/dto/resident.dto";

import { residentClinicalRepository } from "../repository/resident-clinical.repository";
import {
  allergyCorrectionSchema,
  allergySchema,
  clinicalRecordAmendmentSchema,
  clinicalRecordSchema,
  clinicalRecordVoidSchema,
  diagnosisCorrectionSchema,
  diagnosisSchema,
  type AllergyCorrectionInput,
  type AllergyInput,
  type ClinicalRecordAmendmentInput,
  type ClinicalRecordInput,
  type ClinicalRecordVoidInput,
  type DiagnosisCorrectionInput,
  type DiagnosisInput,
} from "../schemas/resident-clinical.schema";

async function requireResident(residentId: string, scope: ResidentScope, db?: Parameters<typeof residentClinicalRepository.findAuthorizedResident>[2]) {
  const resident = await residentClinicalRepository.findAuthorizedResident(residentId, scope, db);
  if (!resident) throw new AppError("RESIDENT_NOT_FOUND", "Utente não encontrado.", 404);
  return resident;
}

function requireUpdated(count: number, code: string, message: string) {
  if (count !== 1) throw new AppError(code, message, 409);
}

export const residentClinicalService = {
  async getHealth(residentId: string, scope: ResidentScope) {
    const resident = await requireResident(residentId, scope);
    return residentClinicalRepository.findHealthByResidentId(resident.id);
  },

  async createDiagnosis(residentId: string, scope: ResidentScope, userId: string, input: DiagnosisInput) {
    const data = diagnosisSchema.parse(input);
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      return residentClinicalRepository.createDiagnosis({ ...data, residentId: resident.id, createdById: userId }, tx);
    });
  },

  async correctDiagnosis(residentId: string, scope: ResidentScope, userId: string, input: DiagnosisCorrectionInput) {
    const data = diagnosisCorrectionSchema.parse(input);
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const previous = await residentClinicalRepository.findDiagnosis(data.supersedesId, resident.id, tx);
      if (!previous) throw new AppError("DIAGNOSIS_NOT_FOUND", "Diagnóstico não encontrado.", 404);
      const now = new Date();
      const result = await residentClinicalRepository.deactivateDiagnosis(previous.id, resident.id, userId, now, tx);
      requireUpdated(result.count, "DIAGNOSIS_NOT_ACTIVE", "O diagnóstico já não está ativo.");
      const { supersedesId, ...clinicalData } = data;
      return residentClinicalRepository.createDiagnosis({ ...clinicalData, residentId: resident.id, createdById: userId, supersedesId }, tx);
    });
  },

  async deactivateDiagnosis(residentId: string, diagnosisId: string, scope: ResidentScope, userId: string) {
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const diagnosis = await residentClinicalRepository.findDiagnosis(diagnosisId, resident.id, tx);
      if (!diagnosis) throw new AppError("DIAGNOSIS_NOT_FOUND", "Diagnóstico não encontrado.", 404);
      const result = await residentClinicalRepository.deactivateDiagnosis(diagnosis.id, resident.id, userId, new Date(), tx);
      requireUpdated(result.count, "DIAGNOSIS_NOT_ACTIVE", "O diagnóstico já não está ativo.");
    });
  },

  async createAllergy(residentId: string, scope: ResidentScope, userId: string, input: AllergyInput) {
    const data = allergySchema.parse(input);
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      return residentClinicalRepository.createAllergy({ ...data, residentId: resident.id, createdById: userId }, tx);
    });
  },

  async correctAllergy(residentId: string, scope: ResidentScope, userId: string, input: AllergyCorrectionInput) {
    const data = allergyCorrectionSchema.parse(input);
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const previous = await residentClinicalRepository.findAllergy(data.supersedesId, resident.id, tx);
      if (!previous) throw new AppError("ALLERGY_NOT_FOUND", "Alergia não encontrada.", 404);
      const now = new Date();
      const result = await residentClinicalRepository.deactivateAllergy(previous.id, resident.id, userId, now, tx);
      requireUpdated(result.count, "ALLERGY_NOT_ACTIVE", "A alergia já não está ativa.");
      const { supersedesId, ...clinicalData } = data;
      return residentClinicalRepository.createAllergy({ ...clinicalData, residentId: resident.id, createdById: userId, supersedesId }, tx);
    });
  },

  async deactivateAllergy(residentId: string, allergyId: string, scope: ResidentScope, userId: string) {
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const allergy = await residentClinicalRepository.findAllergy(allergyId, resident.id, tx);
      if (!allergy) throw new AppError("ALLERGY_NOT_FOUND", "Alergia não encontrada.", 404);
      const result = await residentClinicalRepository.deactivateAllergy(allergy.id, resident.id, userId, new Date(), tx);
      requireUpdated(result.count, "ALLERGY_NOT_ACTIVE", "A alergia já não está ativa.");
    });
  },

  async createClinicalRecord(residentId: string, scope: ResidentScope, userId: string, input: ClinicalRecordInput) {
    const data = clinicalRecordSchema.parse(input);
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      return residentClinicalRepository.createClinicalRecord({ ...data, residentId: resident.id, facilityId: resident.facilityId, authorUserId: userId }, tx);
    });
  },

  async amendClinicalRecord(residentId: string, scope: ResidentScope, userId: string, input: ClinicalRecordAmendmentInput) {
    const data = clinicalRecordAmendmentSchema.parse(input);
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const original = await residentClinicalRepository.findClinicalRecord(data.amendsRecordId, resident.id, tx);
      if (!original) throw new AppError("CLINICAL_RECORD_NOT_FOUND", "Registo clínico não encontrado.", 404);
      const { amendsRecordId, ...clinicalData } = data;
      return residentClinicalRepository.createClinicalRecord({ ...clinicalData, residentId: resident.id, facilityId: resident.facilityId, authorUserId: userId, amendsRecordId }, tx);
    });
  },

  async voidClinicalRecord(residentId: string, scope: ResidentScope, userId: string, input: ClinicalRecordVoidInput) {
    const data = clinicalRecordVoidSchema.parse(input);
    return residentClinicalRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const record = await residentClinicalRepository.findClinicalRecord(data.recordId, resident.id, tx);
      if (!record) throw new AppError("CLINICAL_RECORD_NOT_FOUND", "Registo clínico não encontrado.", 404);
      const result = await residentClinicalRepository.voidClinicalRecord(record.id, resident.id, userId, data.voidReason, new Date(), tx);
      requireUpdated(result.count, "CLINICAL_RECORD_NOT_ACTIVE", "O registo clínico já está anulado.");
    });
  },
};
