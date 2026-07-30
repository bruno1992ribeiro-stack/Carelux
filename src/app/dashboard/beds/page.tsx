import Link from "next/link";

import { getCurrentClient } from "@/lib/session";
import { bedService } from "@/modules/beds/services/bed.service";
import { deleteBed } from "@/modules/beds/actions/delete-bed";

export default async function BedsPage() {
  const client = await getCurrentClient();

  if (!client) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-700">
          Cliente não encontrado
        </h1>

        <p className="mt-2 text-sm text-red-600">
          Não foi possível identificar o cliente da sessão.
        </p>
      </div>
    );
  }

  const beds = await bedService.findAll(client.id);

  const totalBeds = beds.length;

  const occupiedBeds = beds.filter(
    (bed) => bed.occupied
  ).length;

  const availableBeds = beds.filter(
    (bed) => bed.active && !bed.occupied
  ).length;

  const inactiveBeds = beds.filter(
    (bed) => !bed.active
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Alojamento
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Camas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestão das camas existentes em cada quarto.
          </p>
        </div>

        <Link
          href="/dashboard/beds/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Nova Cama
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalBeds}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Livres
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {availableBeds}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Ocupadas
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {occupiedBeds}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Inativas
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-700">
            {inactiveBeds}
          </p>
        </div>
      </section>

      {beds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-700">
            CM
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Ainda não existem camas
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Crie uma cama e associe-a a um quarto.
          </p>

          <Link
            href="/dashboard/beds/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Criar primeira cama
          </Link>
        </div>
      ) : (
        <>
          {/* Versão para telemóvel */}
          <div className="grid gap-4 md:hidden">
            {beds.map((bed) => (
              <article
                key={bed.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {bed.room.facility.name}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Cama {bed.identifier}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Quarto {bed.room.number}
                    </p>
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      bed.occupied
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700",
                    ].join(" ")}
                  >
                    {bed.occupied
                      ? "Ocupada"
                      : "Livre"}
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Estado
                    </span>

                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        bed.active
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-200 text-slate-600",
                      ].join(" ")}
                    >
                      {bed.active
                        ? "Ativa"
                        : "Inativa"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href={`/dashboard/beds/${bed.id}/edit`}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </Link>

                  {bed.occupied ? (
                    <button
                      type="button"
                      disabled
                      title="Uma cama ocupada não pode ser eliminada."
                      className="min-h-11 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
                    >
                      Eliminar
                    </button>
                  ) : (
                    <form
                      action={deleteBed.bind(
                        null,
                        bed.id
                      )}
                    >
                      <button
                        type="submit"
                        className="min-h-11 w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Versão para tablet e computador */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Lar
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Quarto
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cama
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ocupação
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {beds.map((bed) => (
                    <tr
                      key={bed.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-800">
                        {bed.room.facility.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {bed.room.number}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-emerald-100 px-3 text-sm font-bold text-emerald-700">
                          {bed.identifier}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            bed.active
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-600",
                          ].join(" ")}
                        >
                          {bed.active
                            ? "Ativa"
                            : "Inativa"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            bed.occupied
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700",
                          ].join(" ")}
                        >
                          {bed.occupied
                            ? "Ocupada"
                            : "Livre"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/beds/${bed.id}/edit`}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Editar
                          </Link>

                          {bed.occupied ? (
                            <button
                              type="button"
                              disabled
                              title="Uma cama ocupada não pode ser eliminada."
                              className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400"
                            >
                              Eliminar
                            </button>
                          ) : (
                            <form
                              action={deleteBed.bind(
                                null,
                                bed.id
                              )}
                            >
                              <button
                                type="submit"
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Eliminar
                              </button>
                            </form>
                          )}
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