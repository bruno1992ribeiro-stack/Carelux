import Link from "next/link";
import { notFound } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/prisma";
import { getCurrentClientUser } from "@/lib/session";
import { ResidentForm } from "@/modules/residents/components/resident-form";
import { residentService } from "@/modules/residents/services/resident.service";

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
  const user = await getCurrentClientUser();

  if (!user) {
    notFound();
  }

  const scope = { clientId: user.clientId, facilityId: user.facilityId };
  let resident;

  try {
    resident = await residentService.getById(id, scope);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const facilityFilter = user.facilityId
    ? { clientId: user.clientId, id: user.facilityId }
    : { clientId: user.clientId };
  const roomFilter = {
    facility: { clientId: user.clientId },
    ...(user.facilityId ? { facilityId: user.facilityId } : {}),
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
          { active: true, occupied: false },
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Gestão residencial
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Editar utente</h1>
          <p className="mt-1 text-sm text-slate-500">
            {resident.firstName} {resident.lastName}
          </p>
        </div>
        <Link
          href={`/dashboard/residents/${resident.id}`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <ResidentForm
          facilities={facilities}
          rooms={rooms}
          beds={beds}
          facilityLocked={Boolean(user.facilityId)}
          resident={{
            id: resident.id,
            facilityId: resident.facilityId,
            roomId: resident.roomId,
            bedId: resident.bedId,
            firstName: resident.firstName,
            lastName: resident.lastName,
            birthDate: toDateInput(resident.birthDate),
            gender: resident.gender ?? "",
            admissionDate: toDateInput(resident.admissionDate),
            status: resident.status,
          }}
        />
      </div>
    </div>
  );
}
