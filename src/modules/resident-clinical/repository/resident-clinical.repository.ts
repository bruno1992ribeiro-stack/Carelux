import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ResidentScope } from "@/modules/residents/dto/resident.dto";

type ClinicalTransaction = Prisma.TransactionClient;
type ClinicalDb = typeof prisma | ClinicalTransaction;

function residentScopeWhere(scope: ResidentScope): Prisma.ResidentWhereInput {
  return { facility: { clientId: scope.clientId }, ...(scope.facilityId ? { facilityId: scope.facilityId } : {}) };
}

const userDisplaySelect = { fullName: true, role: { select: { name: true } } } satisfies Prisma.UserSelect;

export const residentClinicalRepository = {
  transaction<T>(callback: (tx: ClinicalTransaction) => Promise<T>) {
    return prisma.$transaction(callback, { isolationLevel: "Serializable" });
  },
  findAuthorizedResident(id: string, scope: ResidentScope, db: ClinicalDb = prisma) {
    return db.resident.findFirst({ where: { id, ...residentScopeWhere(scope) }, select: { id: true, facilityId: true } });
  },
  async findHealthByResidentId(residentId: string, db: ClinicalDb = prisma) {
    const [diagnoses, allergies, clinicalRecords] = await Promise.all([
      db.residentDiagnosis.findMany({ where: { residentId }, include: { createdBy: { select: userDisplaySelect }, deactivatedBy: { select: userDisplaySelect } }, orderBy: [{ status: "asc" }, { diagnosedAt: "desc" }, { createdAt: "desc" }] }),
      db.residentAllergy.findMany({ where: { residentId }, include: { createdBy: { select: userDisplaySelect }, deactivatedBy: { select: userDisplaySelect } }, orderBy: [{ status: "asc" }, { severity: "desc" }, { createdAt: "desc" }] }),
      db.residentClinicalRecord.findMany({ where: { residentId }, include: { authorUser: { select: userDisplaySelect }, voidedBy: { select: userDisplaySelect }, facility: { select: { id: true, name: true } } }, orderBy: [{ clinicalAt: "desc" }, { createdAt: "desc" }] }),
    ]);
    return { diagnoses, allergies, clinicalRecords };
  },
  findDiagnosis(id: string, residentId: string, db: ClinicalDb = prisma) { return db.residentDiagnosis.findFirst({ where: { id, residentId } }); },
  createDiagnosis(data: Prisma.ResidentDiagnosisUncheckedCreateInput, db: ClinicalDb = prisma) { return db.residentDiagnosis.create({ data }); },
  deactivateDiagnosis(id: string, residentId: string, userId: string, now: Date, db: ClinicalDb = prisma) {
    return db.residentDiagnosis.updateMany({ where: { id, residentId, status: "ACTIVE" }, data: { status: "INACTIVE", deactivatedAt: now, deactivatedById: userId } });
  },
  findAllergy(id: string, residentId: string, db: ClinicalDb = prisma) { return db.residentAllergy.findFirst({ where: { id, residentId } }); },
  createAllergy(data: Prisma.ResidentAllergyUncheckedCreateInput, db: ClinicalDb = prisma) { return db.residentAllergy.create({ data }); },
  deactivateAllergy(id: string, residentId: string, userId: string, now: Date, db: ClinicalDb = prisma) {
    return db.residentAllergy.updateMany({ where: { id, residentId, status: "ACTIVE" }, data: { status: "INACTIVE", deactivatedAt: now, deactivatedById: userId } });
  },
  findClinicalRecord(id: string, residentId: string, db: ClinicalDb = prisma) { return db.residentClinicalRecord.findFirst({ where: { id, residentId } }); },
  createClinicalRecord(data: Prisma.ResidentClinicalRecordUncheckedCreateInput, db: ClinicalDb = prisma) { return db.residentClinicalRecord.create({ data }); },
  voidClinicalRecord(id: string, residentId: string, userId: string, reason: string, now: Date, db: ClinicalDb = prisma) {
    return db.residentClinicalRecord.updateMany({ where: { id, residentId, status: "ACTIVE" }, data: { status: "VOIDED", voidedAt: now, voidedById: userId, voidReason: reason } });
  },
};
