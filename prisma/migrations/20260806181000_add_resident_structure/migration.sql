BEGIN;

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterEnum
ALTER TYPE "ResidentStatus" ADD VALUE 'HOSPITALIZED';

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Client"
ADD COLUMN "phone" TEXT,
ADD COLUMN "nif" TEXT;

-- AlterTable
ALTER TABLE "Facility"
ADD COLUMN "city" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "postalCode" TEXT;

-- AlterTable
ALTER TABLE "Resident"
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "gender" "Gender",
ADD COLUMN "admissionDate" TIMESTAMP(3),
ADD COLUMN "roomId" UUID,
ADD COLUMN "bedId" UUID;

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Room" (
    "id" UUID NOT NULL,
    "facilityId" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "floor" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "occupied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_facilityId_number_key" ON "Room"("facilityId", "number");

-- CreateIndex
CREATE INDEX "Resident_roomId_idx" ON "Resident"("roomId");

-- CreateIndex
CREATE INDEX "Resident_bedId_idx" ON "Resident"("bedId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
