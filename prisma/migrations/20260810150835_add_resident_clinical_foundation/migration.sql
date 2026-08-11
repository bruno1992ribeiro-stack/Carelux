BEGIN;

-- CreateEnum
CREATE TYPE "ClinicalItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "AllergyType" AS ENUM ('MEDICATION', 'FOOD', 'ENVIRONMENTAL', 'CONTACT', 'OTHER');
CREATE TYPE "AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING');
CREATE TYPE "ClinicalRecordCategory" AS ENUM ('MEDICAL', 'NURSING', 'PHYSIOTHERAPY', 'OCCUPATIONAL_THERAPY', 'SPEECH_THERAPY', 'PSYCHOLOGY', 'NUTRITION', 'SOCIAL_WORK', 'AUDIOLOGY', 'OTHER');
CREATE TYPE "ClinicalRecordStatus" AS ENUM ('ACTIVE', 'VOIDED');

-- CreateTable
CREATE TABLE "ResidentDiagnosis" (
    "id" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "diagnosedAt" TIMESTAMP(3),
    "status" "ClinicalItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "observations" TEXT,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedById" UUID,
    "supersedesId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResidentDiagnosis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResidentAllergy" (
    "id" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "allergen" TEXT NOT NULL,
    "type" "AllergyType",
    "reaction" TEXT NOT NULL,
    "severity" "AllergySeverity" NOT NULL,
    "observations" TEXT,
    "status" "ClinicalItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedById" UUID,
    "supersedesId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResidentAllergy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResidentClinicalRecord" (
    "id" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "facilityId" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "category" "ClinicalRecordCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "clinicalAt" TIMESTAMP(3) NOT NULL,
    "status" "ClinicalRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "voidedAt" TIMESTAMP(3),
    "voidedById" UUID,
    "voidReason" TEXT,
    "amendsRecordId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResidentClinicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResidentDiagnosis_residentId_status_idx" ON "ResidentDiagnosis"("residentId", "status");
CREATE INDEX "ResidentDiagnosis_createdById_idx" ON "ResidentDiagnosis"("createdById");
CREATE INDEX "ResidentDiagnosis_supersedesId_idx" ON "ResidentDiagnosis"("supersedesId");
CREATE INDEX "ResidentAllergy_residentId_status_idx" ON "ResidentAllergy"("residentId", "status");
CREATE INDEX "ResidentAllergy_createdById_idx" ON "ResidentAllergy"("createdById");
CREATE INDEX "ResidentAllergy_supersedesId_idx" ON "ResidentAllergy"("supersedesId");
CREATE INDEX "ResidentClinicalRecord_residentId_clinicalAt_idx" ON "ResidentClinicalRecord"("residentId", "clinicalAt");
CREATE INDEX "ResidentClinicalRecord_facilityId_clinicalAt_idx" ON "ResidentClinicalRecord"("facilityId", "clinicalAt");
CREATE INDEX "ResidentClinicalRecord_authorUserId_idx" ON "ResidentClinicalRecord"("authorUserId");
CREATE INDEX "ResidentClinicalRecord_amendsRecordId_idx" ON "ResidentClinicalRecord"("amendsRecordId");
CREATE INDEX "ResidentClinicalRecord_status_idx" ON "ResidentClinicalRecord"("status");

-- AddForeignKey
ALTER TABLE "ResidentDiagnosis" ADD CONSTRAINT "ResidentDiagnosis_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentDiagnosis" ADD CONSTRAINT "ResidentDiagnosis_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentDiagnosis" ADD CONSTRAINT "ResidentDiagnosis_deactivatedById_fkey" FOREIGN KEY ("deactivatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentDiagnosis" ADD CONSTRAINT "ResidentDiagnosis_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "ResidentDiagnosis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAllergy" ADD CONSTRAINT "ResidentAllergy_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAllergy" ADD CONSTRAINT "ResidentAllergy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAllergy" ADD CONSTRAINT "ResidentAllergy_deactivatedById_fkey" FOREIGN KEY ("deactivatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentAllergy" ADD CONSTRAINT "ResidentAllergy_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "ResidentAllergy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentClinicalRecord" ADD CONSTRAINT "ResidentClinicalRecord_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentClinicalRecord" ADD CONSTRAINT "ResidentClinicalRecord_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentClinicalRecord" ADD CONSTRAINT "ResidentClinicalRecord_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentClinicalRecord" ADD CONSTRAINT "ResidentClinicalRecord_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResidentClinicalRecord" ADD CONSTRAINT "ResidentClinicalRecord_amendsRecordId_fkey" FOREIGN KEY ("amendsRecordId") REFERENCES "ResidentClinicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
