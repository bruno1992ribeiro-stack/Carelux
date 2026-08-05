import Link from "next/link";
import { FacilityStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ResidentForm } from "@/modules/residents/components/resident-form";

export default async function NewResidentPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-700">Utilizador não encontrado</h1>
        <p className="mt-2 text-sm text-red-600">
          Não foi possível identificar o utilizador da sessão.
        </p>
      </div>
    );
  }

  const facilityFilter = user.facilityId
    ? {
        clientId: user.clientId,
        id: user.facilityId,
        status: FacilityStatus.ACTIVE,
      }
    : { clientId: user.clientId, status: FacilityStatus.ACTIVE };
  const roomFilter = {
    facility: {
      clientId: user.clientId,
      status: FacilityStatus.ACTIVE,
    },
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
        active: true,
        occupied: false,
        room: roomFilter,
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
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Novo utente</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registe os dados pessoais e a localização do utente.
          </p>
        </div>
        <Link
          href="/dashboard/residents"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {facilities.length ? (
          <ResidentForm
            mode="create"
            facilities={facilities}
            rooms={rooms}
            beds={beds}
            facilityLocked={Boolean(user.facilityId)}
          />
        ) : (
          <div className="p-6 text-center text-sm text-slate-500">
            Não existem lares disponíveis para registar o utente.
          </div>
        )}
      </div>
    </div>
  );
}
