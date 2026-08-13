import type { MedicationStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ResidentScope } from "@/modules/residents/dto/resident.dto";

export type MedicationTransaction = Prisma.TransactionClient;
type MedicationDb = typeof prisma | MedicationTransaction;

export type MedicationScheduleOccurrenceWriteInput = Omit<
  Prisma.ResidentMedicationScheduleOccurrenceCreateManyInput,
  "id" | "scheduleRuleId" | "position" | "timeOfDay"
> & {
  timeOfDay?: string | null;
};

function residentScopeWhere(scope: ResidentScope): Prisma.ResidentWhereInput {
  return {
    facility: { clientId: scope.clientId },
    ...(scope.facilityId ? { facilityId: scope.facilityId } : {}),
  };
}

function toPrismaTimeOfDay(value: string): Date {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    throw new TypeError("Expected a canonical HH:mm time value.");
  }

  return new Date(
    Date.UTC(1970, 0, 1, Number(match[1]), Number(match[2])),
  );
}

const userDisplaySelect = {
  id: true,
  fullName: true,
  role: { select: { name: true } },
} satisfies Prisma.UserSelect;

const scheduleRuleInclude = {
  occurrences: {
    orderBy: [{ position: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.ResidentMedicationScheduleRuleInclude;

export const residentMedicationRepository = {
  transaction<T>(callback: (tx: MedicationTransaction) => Promise<T>) {
    return prisma.$transaction(callback, { isolationLevel: "Serializable" });
  },

  findAuthorizedResident(
    id: string,
    scope: ResidentScope,
    db: MedicationDb = prisma,
  ) {
    return db.resident.findFirst({
      where: { id, ...residentScopeWhere(scope) },
      select: { id: true, facilityId: true },
    });
  },

  findInternalPrescriber(
    id: string,
    scope: ResidentScope,
    residentFacilityId: string,
    db: MedicationDb = prisma,
  ) {
    return db.user.findFirst({
      where: {
        id,
        active: true,
        clientId: scope.clientId,
        ...(scope.facilityId ? { facilityId: residentFacilityId } : {}),
      },
      select: { id: true, fullName: true },
    });
  },

  findByResidentId(residentId: string, db: MedicationDb = prisma) {
    return db.residentMedication.findMany({
      where: { residentId },
      include: {
        facility: { select: { id: true, name: true } },
        prescriberUser: { select: userDisplaySelect },
        createdBy: { select: userDisplaySelect },
        lastModifiedBy: { select: userDisplaySelect },
        suspendedBy: { select: userDisplaySelect },
        discontinuedBy: { select: userDisplaySelect },
        scheduleRules: {
          include: scheduleRuleInclude,
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [
        { status: "asc" },
        { startDate: "desc" },
        { medicationName: "asc" },
        { id: "asc" },
      ],
    });
  },

  findMedication(id: string, residentId: string, db: MedicationDb = prisma) {
    return db.residentMedication.findFirst({
      where: { id, residentId },
      include: {
        scheduleRules: {
          include: scheduleRuleInclude,
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });
  },

  findRevisions(
    medicationId: string,
    residentId: string,
    db: MedicationDb = prisma,
  ) {
    return db.residentMedicationRevision.findMany({
      where: { medicationId, medication: { residentId } },
      include: {
        changedBy: { select: userDisplaySelect },
        changedAtFacility: { select: { id: true, name: true } },
        prescriberUser: { select: userDisplaySelect },
        suspendedBy: { select: userDisplaySelect },
        discontinuedBy: { select: userDisplaySelect },
      },
      orderBy: [{ changedAt: "desc" }, { id: "desc" }],
    });
  },

  createMedication(
    data: Prisma.ResidentMedicationUncheckedCreateInput,
    db: MedicationDb = prisma,
  ) {
    return db.residentMedication.create({ data });
  },

  createScheduleRule(
    data: Prisma.ResidentMedicationScheduleRuleUncheckedCreateInput,
    db: MedicationDb = prisma,
  ) {
    return db.residentMedicationScheduleRule.create({ data });
  },

  createScheduleOccurrences(
    scheduleRuleId: string,
    occurrences: readonly MedicationScheduleOccurrenceWriteInput[],
    db: MedicationDb = prisma,
  ) {
    return db.residentMedicationScheduleOccurrence.createMany({
      data: occurrences.map(({ timeOfDay, ...occurrence }, position) => ({
        ...occurrence,
        scheduleRuleId,
        position,
        timeOfDay: timeOfDay ? toPrismaTimeOfDay(timeOfDay) : null,
      })),
    });
  },

  updateMedication(
    id: string,
    residentId: string,
    data: Prisma.ResidentMedicationUncheckedUpdateManyInput,
    expectedStatus?: MedicationStatus,
    expectedUpdatedAt?: Date,
    db: MedicationDb = prisma,
  ) {
    return db.residentMedication.updateMany({
      where: {
        id,
        residentId,
        ...(expectedStatus ? { status: expectedStatus } : {}),
        ...(expectedUpdatedAt ? { updatedAt: expectedUpdatedAt } : {}),
      },
      data,
    });
  },

  deleteScheduleOccurrencesByMedicationId(
    medicationId: string,
    db: MedicationDb = prisma,
  ) {
    return db.residentMedicationScheduleOccurrence.deleteMany({
      where: { scheduleRule: { medicationId } },
    });
  },

  deleteScheduleRulesByMedicationId(
    medicationId: string,
    db: MedicationDb = prisma,
  ) {
    return db.residentMedicationScheduleRule.deleteMany({
      where: { medicationId },
    });
  },

  createRevision(
    data: Prisma.ResidentMedicationRevisionUncheckedCreateInput,
    db: MedicationDb = prisma,
  ) {
    return db.residentMedicationRevision.create({ data });
  },
};

export type MedicationRecord = NonNullable<
  Awaited<ReturnType<typeof residentMedicationRepository.findMedication>>
>;
