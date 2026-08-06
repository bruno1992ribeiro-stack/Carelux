import Link from "next/link";

import { StructureNavigation } from "@/components/dashboard/structure-navigation";
import { getFacilityReadScope } from "@/lib/facility-read-scope";
import { facilityService } from "@/modules/facilities/services/facility.service";
import { deleteRoom } from "@/modules/rooms/actions/delete-room";
import { roomService } from "@/modules/rooms/services/room.service";

type RoomsSearchParams = Record<string, string | string[] | undefined>;

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<RoomsSearchParams>;
}) {
  const scope = await getFacilityReadScope();
  const resolvedSearchParams = await searchParams;
  const authorizedFacilities = await facilityService.findAll(
    scope.clientId,
    "ALL",
    scope.type === "facility" ? scope.facilityId : undefined
  );
  const requestedFacilityId = resolvedSearchParams.facilityId;
  const selectedFacility =
    typeof requestedFacilityId === "string"
      ? authorizedFacilities.find(
          (facility) => facility.id === requestedFacilityId
        )
      : undefined;
  const effectiveFacilityId =
    selectedFacility?.id ??
    (scope.type === "facility" ? scope.facilityId : undefined);
  const rooms = await roomService.findAll(
    scope.clientId,
    effectiveFacilityId
  );

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Alojamento
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Quartos
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestão dos quartos pertencentes aos seus lares.
          </p>
        </div>

        <Link
          href="/dashboard/rooms/new"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
        >
          Novo Quarto
        </Link>
      </div>

      <StructureNavigation
        activeSection="rooms"
        basePath="/dashboard/rooms"
        facilities={authorizedFacilities}
        facilityCount={authorizedFacilities.length}
        selectedFacilityId={selectedFacility?.id ?? null}
        searchParams={resolvedSearchParams}
      />

      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Ainda não existem quartos
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {selectedFacility
              ? `Não existem quartos registados em ${selectedFacility.name}.`
              : "Ainda não existem quartos registados."}
          </p>

          <Link
            href="/dashboard/rooms/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Criar primeiro quarto
          </Link>
        </div>
      ) : (
        <>
          {/* Telemóvel */}
          <div className="grid gap-4 md:hidden">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {room.facility.name}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Quarto {room.number}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Piso: {room.floor || "Não indicado"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {room.capacity}{" "}
                    {room.capacity === 1
                      ? "lugar"
                      : "lugares"}
                  </span>
                </div>

                {room.description && (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    {room.description}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href={`/dashboard/rooms/${room.id}/edit`}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Editar
                  </Link>

                  <form
                    action={deleteRoom.bind(
                      null,
                      room.id
                    )}
                    className="w-full"
                  >
                    <button
                      type="submit"
                      className="min-h-11 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>

          {/* Tablet e computador */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Lar
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quarto
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Piso
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Capacidade
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rooms.map((room) => (
                    <tr
                      key={room.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-800">
                        {room.facility.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {room.number}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {room.floor || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {room.capacity}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/rooms/${room.id}/edit`}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Editar
                          </Link>

                          <form
                            action={deleteRoom.bind(
                              null,
                              room.id
                            )}
                          >
                            <button
                              type="submit"
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              Eliminar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
