BEGIN;

-- AlterTable
ALTER TABLE "FamilyMember"
ADD COLUMN "legalRepresentative" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "notes" TEXT;

-- CreateTable
CREATE TABLE "ResidentContact" (
    "id" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "legalRepresentative" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidentContact_pkey" PRIMARY KEY ("id")
);

-- ValidateData
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "FamilyMember" fm
        LEFT JOIN "Resident" r ON r."id" = fm."residentId"
        WHERE r."id" IS NULL
    ) THEN
        RAISE EXCEPTION 'FamilyMember órfão: residentId inexistente';
    END IF;
END
$$;

-- Backfill
INSERT INTO "ResidentContact" (
    "id",
    "residentId",
    "fullName",
    "relationship",
    "email",
    "phone",
    "isPrimary",
    "legalRepresentative",
    "notes",
    "createdAt",
    "updatedAt"
)
SELECT
    fm."id",
    fm."residentId",
    fm."fullName",
    fm."relationship",
    fm."email",
    fm."phone",
    fm."isPrimaryContact",
    fm."legalRepresentative",
    fm."notes",
    fm."createdAt",
    fm."updatedAt"
FROM "FamilyMember" fm;

-- ValidateData
DO $$
DECLARE
    family_member_count BIGINT;
    resident_contact_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO family_member_count FROM "FamilyMember";
    SELECT COUNT(*) INTO resident_contact_count FROM "ResidentContact";

    IF family_member_count <> resident_contact_count THEN
        RAISE EXCEPTION 'Backfill de ResidentContact incompleto: FamilyMember=%, ResidentContact=%',
            family_member_count,
            resident_contact_count;
    END IF;
END
$$;

-- CreateIndex
CREATE INDEX "ResidentContact_residentId_idx" ON "ResidentContact"("residentId");

-- AddForeignKey
ALTER TABLE "ResidentContact" ADD CONSTRAINT "ResidentContact_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
