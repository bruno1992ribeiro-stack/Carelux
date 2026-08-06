import Link from "next/link";
import { FacilityStatus } from "@prisma/client";

import { StructureNavigation } from "@/components/dashboard/structure-navigation";
import { getFacilityReadScope } from "@/lib/facility-read-scope";
import { FacilityStatusDialog } from "@/modules/facilities/components/facility-status-dialog";
import { facilityService } from "@/modules/facilities/services/facility.service";

type FacilityFilter = "active" | "inactive" | "all";

const filters: Array<{ label: string; value: FacilityFilter }> = [
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
  { label: "Todos", value: "all" },
];

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await getFacilityReadScope();
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status;
  const selectedFilter: FacilityFilter =
    status === "inactive" || status === "all" ? status : "active";
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

  const facilityStatus =
    selectedFilter === "active"
      ? FacilityStatus.ACTIVE
      : selectedFilter === "inactive"
        ? FacilityStatus.INACTIVE
        : "ALL";
  const facilities = await facilityService.findAll(
    scope.clientId,
    facilityStatus,
    selectedFacility?.id ??
      (scope.type === "facility" ? scope.facilityId : undefined)
  );
  const canManageStatus = scope.type === "client";

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Estrutura
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Lares
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestão dos lares pertencentes ao seu cliente.
          </p>
        </div>

        <Link
          href="/dashboard/facilities/new"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
        >
          Novo Lar
        </Link>
      </header>

      <StructureNavigation
        activeSection="facilities"
        basePath="/dashboard/facilities"
        facilities={authorizedFacilities}
        facilityCount={authorizedFacilities.length}
        selectedFacilityId={selectedFacility?.id ?? null}
        searchParams={{
          status: selectedFilter === "active" ? undefined : selectedFilter,
        }}
      />

      <nav aria-label="Filtrar lares" className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const selected = selectedFilter === filter.value;
          const params = new URLSearchParams();

          if (filter.value !== "active") {
            params.set("status", filter.value);
          }

          if (selectedFacility) {
            params.set("facilityId", selectedFacility.id);
          }

          const query = params.toString();
          const href = query
            ? `/dashboard/facilities?${query}`
            : "/dashboard/facilities";

          return (
            <Link
              key={filter.value}
              href={href}
              aria-current={selected ? "page" : undefined}
              className={[
                "inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-primary/5 hover:text-foreground",
              ].join(" ")}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {facilities.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-700">
            LR
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Ainda não existem lares
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Crie o primeiro lar para começar a organizar quartos,
            camas e utentes.
          </p>

          <Link
            href="/dashboard/facilities/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Criar primeiro lar
          </Link>
        </section>
      ) : (
        <>
          {/* Telemóvel */}
          <section className="grid gap-4 md:hidden">
            {facilities.map((facility) => (
              <article
                key={facility.id}
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      Lar
                    </p>

                    <h2 className="mt-1 break-words text-xl font-bold text-slate-900">
                      {facility.name}
                    </h2>
                  </div>

                  <span
                    className={[
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      facility.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600",
                    ].join(" ")}
                  >
                    {facility.status === "ACTIVE"
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </div>

                <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-sm text-slate-500">
                      Cidade
                    </dt>

                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {facility.city || "Não indicada"}
                    </dd>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-sm text-slate-500">
                      Telefone
                    </dt>

                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {facility.phone || "Não indicado"}
                    </dd>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-sm text-slate-500">
                      Email
                    </dt>

                    <dd className="min-w-0 break-all text-right text-sm font-semibold text-slate-800">
                      {facility.email || "Não indicado"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href={`/dashboard/facilities/${facility.id}/edit`}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Editar
                  </Link>

                  {canManageStatus && (
                    <FacilityStatusDialog facility={facility} compact />
                  )}
                </div>
              </article>
            ))}
          </section>

          {/* Tablet e computador */}
          <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nome
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cidade
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Telefone
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {facilities.map((facility) => (
                    <tr
                      key={facility.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {facility.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {facility.city || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {facility.phone || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            facility.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600",
                          ].join(" ")}
                        >
                          {facility.status === "ACTIVE"
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/facilities/${facility.id}/edit`}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Editar
                          </Link>

                          {canManageStatus && (
                            <FacilityStatusDialog facility={facility} />
                          )}
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
