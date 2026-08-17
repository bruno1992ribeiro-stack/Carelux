import {
  MedicationRevisionType,
  MedicationScheduleMode,
  MedicationStatus,
  type Prisma,
} from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import type { ResidentScope } from "@/modules/residents/dto/resident.dto";

import {
  type MedicationRecord,
  type MedicationScheduleOccurrenceWriteInput,
  type MedicationTransaction,
  residentMedicationRepository,
} from "../repository/resident-medication.repository";
import {
  medicationCreateSchema,
  medicationDiscontinueSchema,
  medicationEditSchema,
  medicationIdSchema,
  medicationReactivateSchema,
  medicationResidentIdSchema,
  medicationScheduleChangeSchema,
  medicationSuspendSchema,
  type MedicationCreateInput,
  type MedicationDiscontinueInput,
  type MedicationEditInput,
  type MedicationReactivateInput,
  type MedicationScheduleChangeInput,
  type MedicationScheduleInput,
  type MedicationSuspendInput,
} from "../schemas/resident-medication.schema";

const SCHEDULE_SNAPSHOT_VERSION = 1;

type MedicationDetailsInput = MedicationCreateInput | MedicationEditInput;

type ResolvedPrescriber = {
  id: string | null;
  name: string;
};

async function requireResident(
  residentId: string,
  scope: ResidentScope,
  db?: MedicationTransaction,
) {
  const resident = await residentMedicationRepository.findAuthorizedResident(
    residentId,
    scope,
    db,
  );

  if (!resident) {
    throw new AppError("RESIDENT_NOT_FOUND", "Utente não encontrado.", 404);
  }

  return resident;
}

async function requireMedication(
  medicationId: string,
  residentId: string,
  db?: MedicationTransaction,
) {
  const medication = await residentMedicationRepository.findMedication(
    medicationId,
    residentId,
    db,
  );

  if (!medication) {
    throw new AppError("MEDICATION_NOT_FOUND", "Medicação não encontrada.", 404);
  }

  return medication;
}

async function resolvePrescriber(
  input: MedicationDetailsInput,
  scope: ResidentScope,
  residentFacilityId: string,
  db: MedicationTransaction,
): Promise<ResolvedPrescriber> {
  if (!input.prescriberUserId) {
    return { id: null, name: input.prescriberName };
  }

  const prescriber = await residentMedicationRepository.findInternalPrescriber(
    input.prescriberUserId,
    scope,
    residentFacilityId,
    db,
  );

  if (!prescriber) {
    throw new AppError(
      "PRESCRIBER_NOT_FOUND",
      "O prescritor interno não pertence ao âmbito autorizado.",
      400,
    );
  }

  return { id: prescriber.id, name: prescriber.fullName };
}

function editableMedicationData(
  input: MedicationDetailsInput,
  prescriber: ResolvedPrescriber,
) {
  return {
    prescriberUserId: prescriber.id,
    prescriberName: prescriber.name,
    medicationName: input.medicationName,
    dosage: input.dosage,
    pharmaceuticalForm: input.pharmaceuticalForm,
    administrationRoute: input.administrationRoute,
    indication: input.indication ?? null,
    observations: input.observations ?? null,
    startDate: input.startDate,
    endDate: input.endDate,
  };
}

function unreachableSchedule(value: never): never {
  throw new TypeError(`Unsupported medication schedule: ${String(value)}`);
}

function scheduleRuleData(
  medicationId: string,
  schedule: MedicationScheduleInput,
): Prisma.ResidentMedicationScheduleRuleUncheckedCreateInput {
  const common = {
    medicationId,
    mode: schedule.mode,
    weekdays: schedule.weekdays,
    instructions: schedule.instructions ?? null,
  };

  switch (schedule.mode) {
    case MedicationScheduleMode.DAILY_FREQUENCY:
      return { ...common, timesPerDay: schedule.timesPerDay };
    case MedicationScheduleMode.FIXED_TIMES:
    case MedicationScheduleMode.CARE_MOMENTS:
      return common;
    case MedicationScheduleMode.INTERVAL:
      return { ...common, intervalHours: schedule.intervalHours };
    case MedicationScheduleMode.PRN:
      return {
        ...common,
        prnReason: schedule.prnReason,
        maxDosesPerDay: schedule.maxDosesPerDay,
        minimumIntervalHours: schedule.minimumIntervalHours,
      };
    default:
      return unreachableSchedule(schedule);
  }
}

function scheduleOccurrences(
  schedule: MedicationScheduleInput,
): MedicationScheduleOccurrenceWriteInput[] {
  switch (schedule.mode) {
    case MedicationScheduleMode.FIXED_TIMES:
      return schedule.occurrences.map((occurrence) => ({
        timeOfDay: occurrence.timeOfDay,
        careMoment: null,
        doseOverride: occurrence.doseOverride ?? null,
      }));
    case MedicationScheduleMode.CARE_MOMENTS:
      return schedule.occurrences.map((occurrence) => ({
        timeOfDay: null,
        careMoment: occurrence.careMoment,
        doseOverride: occurrence.doseOverride ?? null,
      }));
    case MedicationScheduleMode.DAILY_FREQUENCY:
    case MedicationScheduleMode.INTERVAL:
    case MedicationScheduleMode.PRN:
      return [];
    default:
      return unreachableSchedule(schedule);
  }
}

async function persistSchedule(
  medicationId: string,
  schedule: MedicationScheduleInput,
  db: MedicationTransaction,
) {
  const rule = await residentMedicationRepository.createScheduleRule(
    scheduleRuleData(medicationId, schedule),
    db,
  );
  const occurrences = scheduleOccurrences(schedule);

  if (occurrences.length > 0) {
    await residentMedicationRepository.createScheduleOccurrences(
      rule.id,
      occurrences,
      db,
    );
  }
}

function formatTimeOfDay(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function scheduleSnapshot(medication: MedicationRecord): Prisma.InputJsonObject {
  if (medication.scheduleRules.length !== 1) {
    throw new AppError(
      "MEDICATION_SCHEDULE_INCONSISTENT",
      "A medicação não possui um esquema posológico consistente.",
      500,
    );
  }

  const rule = medication.scheduleRules[0];

  return {
    version: SCHEDULE_SNAPSHOT_VERSION,
    mode: rule.mode,
    timesPerDay: rule.timesPerDay,
    intervalHours: rule.intervalHours,
    weekdays: [...rule.weekdays],
    prnReason: rule.prnReason,
    maxDosesPerDay: rule.maxDosesPerDay,
    minimumIntervalHours: rule.minimumIntervalHours,
    instructions: rule.instructions,
    occurrences: rule.occurrences.map((occurrence) => ({
      timeOfDay: formatTimeOfDay(occurrence.timeOfDay),
      careMoment: occurrence.careMoment,
      doseOverride: occurrence.doseOverride,
      position: occurrence.position,
    })),
  };
}

function revisionData(
  medication: MedicationRecord,
  actorUserId: string,
  facilityId: string,
  changeType: MedicationRevisionType,
  changeReason?: string | null,
): Prisma.ResidentMedicationRevisionUncheckedCreateInput {
  return {
    medicationId: medication.id,
    changedById: actorUserId,
    changedAtFacilityId: facilityId,
    changeType,
    changeReason: changeReason ?? null,
    prescriberUserId: medication.prescriberUserId,
    prescriberName: medication.prescriberName,
    medicationName: medication.medicationName,
    dosage: medication.dosage,
    pharmaceuticalForm: medication.pharmaceuticalForm,
    administrationRoute: medication.administrationRoute,
    indication: medication.indication,
    observations: medication.observations,
    startDate: medication.startDate,
    endDate: medication.endDate,
    status: medication.status,
    suspendedAt: medication.suspendedAt,
    suspendedById: medication.suspendedById,
    suspensionReason: medication.suspensionReason,
    discontinuedAt: medication.discontinuedAt,
    discontinuedById: medication.discontinuedById,
    discontinuationReason: medication.discontinuationReason,
    scheduleSnapshot: scheduleSnapshot(medication),
    scheduleSnapshotVersion: SCHEDULE_SNAPSHOT_VERSION,
  };
}

function requireUpdated(count: number) {
  if (count !== 1) {
    throw new AppError(
      "MEDICATION_STATE_CONFLICT",
      "A medicação foi alterada por outro utilizador.",
      409,
    );
  }
}

function nextUpdatedAt(previousUpdatedAt: Date): Date {
  return new Date(Math.max(Date.now(), previousUpdatedAt.getTime() + 1));
}

function requireNotDiscontinued(medication: MedicationRecord) {
  if (medication.status === MedicationStatus.DISCONTINUED) {
    throw new AppError(
      "MEDICATION_DISCONTINUED",
      "Uma medicação descontinuada não pode ser alterada.",
      409,
    );
  }
}

export const residentMedicationService = {
  async listByResident(residentId: string, scope: ResidentScope) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const resident = await requireResident(validatedResidentId, scope);
    return residentMedicationRepository.findByResidentId(resident.id);
  },

  async getMedication(
    residentId: string,
    medicationId: string,
    scope: ResidentScope,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const validatedMedicationId = medicationIdSchema.parse(medicationId);
    const resident = await requireResident(validatedResidentId, scope);
    return requireMedication(validatedMedicationId, resident.id);
  },

  async getRevisions(
    residentId: string,
    medicationId: string,
    scope: ResidentScope,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const validatedMedicationId = medicationIdSchema.parse(medicationId);
    const resident = await requireResident(validatedResidentId, scope);
    const medication = await requireMedication(validatedMedicationId, resident.id);
    return residentMedicationRepository.findRevisions(medication.id, resident.id);
  },

  async createMedication(
    residentId: string,
    scope: ResidentScope,
    actorUserId: string,
    input: MedicationCreateInput,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const data = medicationCreateSchema.parse(input);

    return residentMedicationRepository.transaction(async (tx) => {
      const resident = await requireResident(validatedResidentId, scope, tx);
      const prescriber = await resolvePrescriber(
        data,
        scope,
        resident.facilityId,
        tx,
      );
      const medication = await residentMedicationRepository.createMedication(
        {
          ...editableMedicationData(data, prescriber),
          residentId: resident.id,
          facilityId: resident.facilityId,
          createdById: actorUserId,
          lastModifiedById: actorUserId,
          status: MedicationStatus.ACTIVE,
        },
        tx,
      );

      await persistSchedule(medication.id, data.schedule, tx);
      return requireMedication(medication.id, resident.id, tx);
    });
  },

  async editMedication(
    residentId: string,
    medicationId: string,
    scope: ResidentScope,
    actorUserId: string,
    input: MedicationEditInput,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const validatedMedicationId = medicationIdSchema.parse(medicationId);
    const data = medicationEditSchema.parse(input);

    return residentMedicationRepository.transaction(async (tx) => {
      const resident = await requireResident(validatedResidentId, scope, tx);
      const medication = await requireMedication(
        validatedMedicationId,
        resident.id,
        tx,
      );
      requireNotDiscontinued(medication);
      const prescriber = await resolvePrescriber(
        data,
        scope,
        resident.facilityId,
        tx,
      );
      const previousRevision = revisionData(
        medication,
        actorUserId,
        resident.facilityId,
        MedicationRevisionType.EDITED,
      );
      const result = await residentMedicationRepository.updateMedication(
        medication.id,
        resident.id,
        {
          ...editableMedicationData(data, prescriber),
          lastModifiedById: actorUserId,
        },
        medication.status,
        medication.updatedAt,
        tx,
      );
      requireUpdated(result.count);
      await residentMedicationRepository.createRevision(previousRevision, tx);
    });
  },

  async changeMedicationSchedule(
    residentId: string,
    scope: ResidentScope,
    actorUserId: string,
    input: MedicationScheduleChangeInput,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const data = medicationScheduleChangeSchema.parse(input);

    return residentMedicationRepository.transaction(async (tx) => {
      const resident = await requireResident(validatedResidentId, scope, tx);
      const medication = await requireMedication(
        data.medicationId,
        resident.id,
        tx,
      );
      requireNotDiscontinued(medication);
      const previousRevision = revisionData(
        medication,
        actorUserId,
        resident.facilityId,
        MedicationRevisionType.SCHEDULE_CHANGED,
        data.reason,
      );
      const result = await residentMedicationRepository.updateMedication(
        medication.id,
        resident.id,
        {
          lastModifiedById: actorUserId,
          updatedAt: nextUpdatedAt(medication.updatedAt),
        },
        medication.status,
        medication.updatedAt,
        tx,
      );
      requireUpdated(result.count);
      await residentMedicationRepository.createRevision(previousRevision, tx);
      await residentMedicationRepository.deleteScheduleOccurrencesByMedicationId(
        medication.id,
        tx,
      );
      await residentMedicationRepository.deleteScheduleRulesByMedicationId(
        medication.id,
        tx,
      );
      await persistSchedule(medication.id, data.schedule, tx);
    });
  },

  async suspendMedication(
    residentId: string,
    scope: ResidentScope,
    actorUserId: string,
    input: MedicationSuspendInput,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const data = medicationSuspendSchema.parse(input);

    return residentMedicationRepository.transaction(async (tx) => {
      const resident = await requireResident(validatedResidentId, scope, tx);
      const medication = await requireMedication(
        data.medicationId,
        resident.id,
        tx,
      );

      if (medication.status !== MedicationStatus.ACTIVE) {
        throw new AppError(
          "MEDICATION_NOT_ACTIVE",
          "Apenas uma medicação ativa pode ser suspensa.",
          409,
        );
      }

      const previousRevision = revisionData(
        medication,
        actorUserId,
        resident.facilityId,
        MedicationRevisionType.SUSPENDED,
        data.reason,
      );
      const now = new Date();
      const result = await residentMedicationRepository.updateMedication(
        medication.id,
        resident.id,
        {
          status: MedicationStatus.SUSPENDED,
          suspendedAt: now,
          suspendedById: actorUserId,
          suspensionReason: data.reason,
          discontinuedAt: null,
          discontinuedById: null,
          discontinuationReason: null,
          lastModifiedById: actorUserId,
        },
        MedicationStatus.ACTIVE,
        medication.updatedAt,
        tx,
      );
      requireUpdated(result.count);
      await residentMedicationRepository.createRevision(previousRevision, tx);
    });
  },

  async reactivateMedication(
    residentId: string,
    scope: ResidentScope,
    actorUserId: string,
    input: MedicationReactivateInput,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const data = medicationReactivateSchema.parse(input);

    return residentMedicationRepository.transaction(async (tx) => {
      const resident = await requireResident(validatedResidentId, scope, tx);
      const medication = await requireMedication(
        data.medicationId,
        resident.id,
        tx,
      );

      if (medication.status !== MedicationStatus.SUSPENDED) {
        throw new AppError(
          "MEDICATION_NOT_SUSPENDED",
          "Apenas uma medicação suspensa pode ser reativada.",
          409,
        );
      }

      const previousRevision = revisionData(
        medication,
        actorUserId,
        resident.facilityId,
        MedicationRevisionType.REACTIVATED,
        data.reason,
      );
      const result = await residentMedicationRepository.updateMedication(
        medication.id,
        resident.id,
        {
          status: MedicationStatus.ACTIVE,
          suspendedAt: null,
          suspendedById: null,
          suspensionReason: null,
          lastModifiedById: actorUserId,
        },
        MedicationStatus.SUSPENDED,
        medication.updatedAt,
        tx,
      );
      requireUpdated(result.count);
      await residentMedicationRepository.createRevision(previousRevision, tx);
    });
  },

  async discontinueMedication(
    residentId: string,
    scope: ResidentScope,
    actorUserId: string,
    input: MedicationDiscontinueInput,
  ) {
    const validatedResidentId = medicationResidentIdSchema.parse(residentId);
    const data = medicationDiscontinueSchema.parse(input);

    return residentMedicationRepository.transaction(async (tx) => {
      const resident = await requireResident(validatedResidentId, scope, tx);
      const medication = await requireMedication(
        data.medicationId,
        resident.id,
        tx,
      );

      if (
        medication.status !== MedicationStatus.ACTIVE &&
        medication.status !== MedicationStatus.SUSPENDED
      ) {
        throw new AppError(
          "MEDICATION_NOT_DISCONTINUABLE",
          "A medicação já se encontra descontinuada.",
          409,
        );
      }

      const previousRevision = revisionData(
        medication,
        actorUserId,
        resident.facilityId,
        MedicationRevisionType.DISCONTINUED,
        data.reason,
      );
      const now = new Date();
      const result = await residentMedicationRepository.updateMedication(
        medication.id,
        resident.id,
        {
          status: MedicationStatus.DISCONTINUED,
          discontinuedAt: now,
          discontinuedById: actorUserId,
          discontinuationReason: data.reason,
          lastModifiedById: actorUserId,
        },
        medication.status,
        medication.updatedAt,
        tx,
      );
      requireUpdated(result.count);
      await residentMedicationRepository.createRevision(previousRevision, tx);
    });
  },
};
