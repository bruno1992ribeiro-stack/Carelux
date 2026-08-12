BEGIN;

-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISCONTINUED');
CREATE TYPE "MedicationScheduleMode" AS ENUM ('DAILY_FREQUENCY', 'FIXED_TIMES', 'CARE_MOMENTS', 'INTERVAL', 'PRN');
CREATE TYPE "MedicationCareMoment" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'BEDTIME');
CREATE TYPE "MedicationWeekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE "MedicationRevisionType" AS ENUM ('EDITED', 'SCHEDULE_CHANGED', 'SUSPENDED', 'REACTIVATED', 'DISCONTINUED', 'STATUS_CORRECTED');

-- CreateTable
CREATE TABLE "ResidentMedication" (
    "id" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "facilityId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "lastModifiedById" UUID NOT NULL,
    "prescriberUserId" UUID,
    "prescriberName" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "pharmaceuticalForm" TEXT NOT NULL,
    "administrationRoute" TEXT NOT NULL,
    "indication" TEXT,
    "observations" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "status" "MedicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "suspendedAt" TIMESTAMP(3),
    "suspendedById" UUID,
    "suspensionReason" TEXT,
    "discontinuedAt" TIMESTAMP(3),
    "discontinuedById" UUID,
    "discontinuationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResidentMedication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResidentMedicationScheduleRule" (
    "id" UUID NOT NULL,
    "medicationId" UUID NOT NULL,
    "mode" "MedicationScheduleMode" NOT NULL,
    "timesPerDay" INTEGER,
    "intervalHours" INTEGER,
    "weekdays" "MedicationWeekday"[] NOT NULL DEFAULT ARRAY[]::"MedicationWeekday"[],
    "prnReason" TEXT,
    "maxDosesPerDay" INTEGER,
    "minimumIntervalHours" INTEGER,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResidentMedicationScheduleRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResidentMedicationScheduleOccurrence" (
    "id" UUID NOT NULL,
    "scheduleRuleId" UUID NOT NULL,
    "timeOfDay" TIME(0),
    "careMoment" "MedicationCareMoment",
    "doseOverride" TEXT,
    "position" INTEGER NOT NULL,
    CONSTRAINT "ResidentMedicationScheduleOccurrence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResidentMedicationRevision" (
    "id" UUID NOT NULL,
    "medicationId" UUID NOT NULL,
    "changedById" UUID NOT NULL,
    "changedAtFacilityId" UUID NOT NULL,
    "changeType" "MedicationRevisionType" NOT NULL,
    "changeReason" TEXT,
    "prescriberUserId" UUID,
    "prescriberName" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "pharmaceuticalForm" TEXT NOT NULL,
    "administrationRoute" TEXT NOT NULL,
    "indication" TEXT,
    "observations" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "status" "MedicationStatus" NOT NULL,
    "suspendedAt" TIMESTAMP(3),
    "suspendedById" UUID,
    "suspensionReason" TEXT,
    "discontinuedAt" TIMESTAMP(3),
    "discontinuedById" UUID,
    "discontinuationReason" TEXT,
    "scheduleSnapshot" JSONB NOT NULL,
    "scheduleSnapshotVersion" INTEGER NOT NULL DEFAULT 1,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResidentMedicationRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResidentMedication_residentId_status_startDate_idx" ON "ResidentMedication"("residentId", "status", "startDate");
CREATE INDEX "ResidentMedication_residentId_startDate_idx" ON "ResidentMedication"("residentId", "startDate");
CREATE INDEX "ResidentMedication_facilityId_status_idx" ON "ResidentMedication"("facilityId", "status");
CREATE INDEX "ResidentMedication_prescriberUserId_idx" ON "ResidentMedication"("prescriberUserId");
CREATE INDEX "ResidentMedication_status_endDate_idx" ON "ResidentMedication"("status", "endDate");
CREATE INDEX "ResidentMedicationScheduleRule_medicationId_idx" ON "ResidentMedicationScheduleRule"("medicationId");
CREATE INDEX "ResidentMedicationScheduleRule_mode_idx" ON "ResidentMedicationScheduleRule"("mode");
CREATE UNIQUE INDEX "ResidentMedicationScheduleOccurrence_scheduleRuleId_position_key" ON "ResidentMedicationScheduleOccurrence"("scheduleRuleId", "position");
CREATE INDEX "ResidentMedicationScheduleOccurrence_scheduleRuleId_timeOfDay_idx" ON "ResidentMedicationScheduleOccurrence"("scheduleRuleId", "timeOfDay");
CREATE INDEX "ResidentMedicationScheduleOccurrence_scheduleRuleId_careMoment_idx" ON "ResidentMedicationScheduleOccurrence"("scheduleRuleId", "careMoment");
CREATE INDEX "ResidentMedicationRevision_medicationId_changedAt_idx" ON "ResidentMedicationRevision"("medicationId", "changedAt");
CREATE INDEX "ResidentMedicationRevision_changedById_idx" ON "ResidentMedicationRevision"("changedById");
CREATE INDEX "ResidentMedicationRevision_changedAtFacilityId_idx" ON "ResidentMedicationRevision"("changedAtFacilityId");
CREATE INDEX "ResidentMedicationRevision_changeType_idx" ON "ResidentMedicationRevision"("changeType");

-- AddForeignKey
ALTER TABLE "ResidentMedication" ADD CONSTRAINT "ResidentMedication_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedication" ADD CONSTRAINT "ResidentMedication_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedication" ADD CONSTRAINT "ResidentMedication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedication" ADD CONSTRAINT "ResidentMedication_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedication" ADD CONSTRAINT "ResidentMedication_prescriberUserId_fkey" FOREIGN KEY ("prescriberUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedication" ADD CONSTRAINT "ResidentMedication_suspendedById_fkey" FOREIGN KEY ("suspendedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedication" ADD CONSTRAINT "ResidentMedication_discontinuedById_fkey" FOREIGN KEY ("discontinuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationScheduleRule" ADD CONSTRAINT "ResidentMedicationScheduleRule_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "ResidentMedication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationScheduleOccurrence" ADD CONSTRAINT "ResidentMedicationScheduleOccurrence_scheduleRuleId_fkey" FOREIGN KEY ("scheduleRuleId") REFERENCES "ResidentMedicationScheduleRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationRevision" ADD CONSTRAINT "ResidentMedicationRevision_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "ResidentMedication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationRevision" ADD CONSTRAINT "ResidentMedicationRevision_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationRevision" ADD CONSTRAINT "ResidentMedicationRevision_changedAtFacilityId_fkey" FOREIGN KEY ("changedAtFacilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationRevision" ADD CONSTRAINT "ResidentMedicationRevision_prescriberUserId_fkey" FOREIGN KEY ("prescriberUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationRevision" ADD CONSTRAINT "ResidentMedicationRevision_suspendedById_fkey" FOREIGN KEY ("suspendedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentMedicationRevision" ADD CONSTRAINT "ResidentMedicationRevision_discontinuedById_fkey" FOREIGN KEY ("discontinuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
