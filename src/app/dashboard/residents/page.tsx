import Link from "next/link";

import { StructureNavigation } from "@/components/dashboard/structure-navigation";
import { getFacilityReadScope } from "@/lib/facility-read-scope";
import { facilityService } from "@/modules/facilities/services/facility.service";
import { residentService } from "@/modules/residents/services/resident.service";

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Ativo",
    HOSPITALIZED: "Hospitalizado",
    DISCHARGED: "Alta",
    DECEASED: "Falecido",
  };

  return labels[status] ?? status;
}

function getStatusClasses(status: string) {
  const classes: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    HOSPITALIZED: "bg-amber-100 text-amber-700",
    DISCHARGED: "bg-blue-100 text-blue-700",
    DECEASED: "bg-slate-200 text-slate-600",
  };

  return classes[status] ?? "bg-slate-100 text-slate-600";
}

const dateFormatter = new Intl.DateTimeFormat("pt-PT");

type ResidentsSearchParams = Record<string, string | string[] | undefined>;

export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: Promise<ResidentsSearchParams>;
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
  const residents = await residentService.findAll({
    clientId: scope.clientId,
    facilityId: effectiveFacilityId,
  });
  const activeResidents = residents.filter((resident) => resident.status === "ACTIVE").length;
  const hospitalizedResidents = residents.filter(
    (resident) => resident.status === "HOSPITALIZED"
  ).length;
  const residentsWithoutBed = residents.filter((resident) => !resident.bedId).length;

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Gestão residencial
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Utentes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulte e gira os utentes registados nas suas unidades.
          </p>
        </div>
        <Link
          href="/dashboard/residents/new"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
        >
          Novo utente
        </Link>
      </header>

      <StructureNavigation
        activeSection="residents"
        basePath="/dashboard/residents"
        facilities={authorizedFacilities}
        facilityCount={authorizedFacilities.length}
        selectedFacilityId={selectedFacility?.id ?? null}
        searchParams={resolvedSearchParams}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total", residents.length, "border-slate-200 bg-white text-slate-900"],
          ["Ativos", activeResidents, "border-emerald-200 bg-emerald-50 text-emerald-700"],
          ["Hospitalizados", hospitalizedResidents, "border-amber-200 bg-amber-50 text-amber-700"],
          ["Sem cama", residentsWithoutBed, "border-blue-200 bg-blue-50 text-blue-700"],
        ].map(([label, value, classes]) => (
          <div key={String(label)} className={`rounded-2xl border p-4 shadow-sm ${classes}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      {residents.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-700">
            UT
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Ainda não existem utentes
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {selectedFacility
              ? `Não existem utentes registados em ${selectedFacility.name}.`
              : "Ainda não existem utentes registados."}
          </p>
          <Link
            href="/dashboard/residents/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Criar primeiro utente
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 lg:hidden">
            {residents.map((resident) => (
              <article
                key={resident.id}
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {resident.facility.name}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {resident.firstName} {resident.lastName}
                    </h2>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(resident.status)}`}>
                    {getStatusLabel(resident.status)}
                  </span>
                </div>

                <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm text-slate-500">Quarto</dt>
                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {resident.room?.number ?? "Não atribuído"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm text-slate-500">Cama</dt>
                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {resident.bed?.identifier ?? "Não atribuída"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm text-slate-500">Admissão</dt>
                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {resident.admissionDate
                        ? dateFormatter.format(resident.admissionDate)
                        : "Não indicada"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link
                    href={`/dashboard/residents/${resident.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/dashboard/residents/${resident.id}/edit`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <section className="hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {[
                      ["Utente", "w-[22%]"],
                      ["Unidade", "w-[17%]"],
                      ["Quarto", "w-[10%]"],
                      ["Cama", "w-[10%]"],
                      ["Admissão", "w-[13%]"],
                      ["Estado", "w-[13%]"],
                      ["Ações", "w-[250px] text-right"],
                    ].map(([label, width]) => (
                      <th key={label} className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${width}`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {residents.map((resident) => (
                    <tr key={resident.id} className="transition hover:bg-slate-50">
                    <td className="truncate px-4 py-4 text-sm font-semibold text-slate-900">
                      {resident.firstName} {resident.lastName}
                    </td>
                    <td className="truncate px-4 py-4 text-sm text-slate-600">{resident.facility.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{resident.room?.number ?? "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{resident.bed?.identifier ?? "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {resident.admissionDate ? dateFormatter.format(resident.admissionDate) : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(resident.status)}`}>
                        {getStatusLabel(resident.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 pr-5">
                      <div className="flex min-w-max justify-end gap-1.5">
                        <Link href={`/dashboard/residents/${resident.id}`} className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          Ver
                        </Link>
                        <Link href={`/dashboard/residents/${resident.id}/edit`} className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          Editar
                        </Link>
                      </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
