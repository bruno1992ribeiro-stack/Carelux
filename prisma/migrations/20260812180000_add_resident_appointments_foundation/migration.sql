BEGIN;

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AppointmentRevisionType" AS ENUM ('EDITED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'REOPENED', 'STATUS_CORRECTED');

-- CreateTable
CREATE TABLE "ResidentAppointment" (
    "id" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "facilityId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "lastModifiedById" UUID NOT NULL,
    "responsibleUserId" UUID,
    "professionalName" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "specialty" TEXT,
    "location" TEXT,
    "reason" TEXT,
    "observations" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completedAt" TIMESTAMP(3),
    "completedById" UUID,
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" UUID,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResidentAppointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResidentAppointmentRevision" (
    "id" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "changedById" UUID NOT NULL,
    "changeType" "AppointmentRevisionType" NOT NULL,
    "changeReason" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "type" TEXT NOT NULL,
    "specialty" TEXT,
    "professionalName" TEXT NOT NULL,
    "responsibleUserId" UUID,
    "location" TEXT,
    "reason" TEXT,
    "observations" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedById" UUID,
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" UUID,
    "cancellationReason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResidentAppointmentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResidentAppointment_residentId_status_scheduledAt_idx" ON "ResidentAppointment"("residentId", "status", "scheduledAt");
CREATE INDEX "ResidentAppointment_residentId_scheduledAt_idx" ON "ResidentAppointment"("residentId", "scheduledAt");
CREATE INDEX "ResidentAppointment_facilityId_scheduledAt_idx" ON "ResidentAppointment"("facilityId", "scheduledAt");
CREATE INDEX "ResidentAppointment_responsibleUserId_scheduledAt_idx" ON "ResidentAppointment"("responsibleUserId", "scheduledAt");
CREATE INDEX "ResidentAppointment_status_scheduledAt_idx" ON "ResidentAppointment"("status", "scheduledAt");
CREATE INDEX "ResidentAppointmentRevision_appointmentId_changedAt_idx" ON "ResidentAppointmentRevision"("appointmentId", "changedAt");
CREATE INDEX "ResidentAppointmentRevision_changedById_idx" ON "ResidentAppointmentRevision"("changedById");
CREATE INDEX "ResidentAppointmentRevision_responsibleUserId_idx" ON "ResidentAppointmentRevision"("responsibleUserId");
CREATE INDEX "ResidentAppointmentRevision_changeType_idx" ON "ResidentAppointmentRevision"("changeType");

-- AddForeignKey
ALTER TABLE "ResidentAppointment" ADD CONSTRAINT "ResidentAppointment_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointment" ADD CONSTRAINT "ResidentAppointment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointment" ADD CONSTRAINT "ResidentAppointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointment" ADD CONSTRAINT "ResidentAppointment_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointment" ADD CONSTRAINT "ResidentAppointment_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointment" ADD CONSTRAINT "ResidentAppointment_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointment" ADD CONSTRAINT "ResidentAppointment_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointmentRevision" ADD CONSTRAINT "ResidentAppointmentRevision_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "ResidentAppointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointmentRevision" ADD CONSTRAINT "ResidentAppointmentRevision_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointmentRevision" ADD CONSTRAINT "ResidentAppointmentRevision_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointmentRevision" ADD CONSTRAINT "ResidentAppointmentRevision_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAppointmentRevision" ADD CONSTRAINT "ResidentAppointmentRevision_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
