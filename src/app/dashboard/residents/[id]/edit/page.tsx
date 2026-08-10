import { FacilityStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { Permission } from "@/modules/authorization/permissions";
import { ResidentForm } from "@/modules/residents/components/resident-form";
import { getResidentWorkspace } from "@/modules/residents/server/get-resident-workspace";
import { requireResidentPermission } from "@/modules/residents/server/resident-authorization";

export const dynamic = "force-dynamic";

function toDateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditResidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [resident, scope] = await Promise.all([
    getResidentWorkspace(id),
    requireResidentPermission(Permission.EDIT_RESIDENT),
  ]);
  const facilityId = scope.type === "facility" ? scope.facilityId : undefined;

  const facilityFilter = facilityId
    ? {
        clientId: scope.clientId,
        id: facilityId,
        OR: [
          { status: FacilityStatus.ACTIVE },
          { id: resident.facilityId },
        ],
      }
    : {
        clientId: scope.clientId,
        OR: [
          { status: FacilityStatus.ACTIVE },
          { id: resident.facilityId },
        ],
      };
  const roomFilter = {
    facility: { clientId: scope.clientId },
    ...(facilityId ? { facilityId } : {}),
    OR: [
      { facility: { status: FacilityStatus.ACTIVE } },
      ...(resident.roomId ? [{ id: resident.roomId }] : []),
    ],
  };

  const [facilities, rooms, beds] = await Promise.all([
    prisma.facility.findMany({
      where: facilityFilter,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.room.findMany({
      where: roomFilter,
      select: { id: true, facilityId: true, number: true },
      orderBy: [{ facility: { name: "asc" } }, { number: "asc" }],
    }),
    prisma.bed.findMany({
      where: {
        room: roomFilter,
        OR: [
          {
            active: true,
            occupied: false,
            room: {
              facility: {
                status: FacilityStatus.ACTIVE,
              },
            },
          },
          ...(resident.bedId ? [{ id: resident.bedId }] : []),
        ],
      },
      select: {
        id: true,
        roomId: true,
        identifier: true,
        active: true,
        occupied: true,
      },
      orderBy: [{ room: { number: "asc" } }, { identifier: "asc" }],
    }),
  ]);

  return (
    <section aria-labelledby="edit-resident-title" className="flex flex-col gap-4">
      <h2 id="edit-resident-title" className="text-lg font-semibold text-foreground">
        Editar dados do utente
      </h2>
      <div className="card-warm p-5 sm:p-7">
        <ResidentForm
          mode="edit"
          facilities={facilities}
          rooms={rooms}
          beds={beds}
          facilityLocked={Boolean(facilityId)}
          resident={{
            id: resident.id,
            facilityId: resident.facilityId,
            roomId: resident.roomId,
            bedId: resident.bedId,
            firstName: resident.firstName,
            lastName: resident.lastName,
            birthDate: toDateInput(resident.birthDate),
            gender: resident.gender,
            admissionDate: toDateInput(resident.admissionDate),
            status: resident.status,
          }}
        />
      </div>
    </section>
  );
}
