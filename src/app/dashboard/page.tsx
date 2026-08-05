import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentClientUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentClientUser();

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-700">
          Utilizador não encontrado
        </h1>

        <p className="mt-2 text-sm text-red-600">
          Não foi possível obter os dados da sessão atual.
        </p>
      </div>
    );
  }

  const clientId = user.clientId;

  const [
    facilitiesCount,
    roomsCount,
    bedsCount,
    availableBedsCount,
    occupiedBedsCount,
    activeResidentsCount,
    facilities,
  ] = await Promise.all([
    prisma.facility.count({
      where: {
        clientId,
      },
    }),

    prisma.room.count({
      where: {
        facility: {
          clientId,
        },
      },
    }),

    prisma.bed.count({
      where: {
        room: {
          facility: {
            clientId,
          },
        },
      },
    }),

    prisma.bed.count({
      where: {
        active: true,
        occupied: false,
        room: {
          facility: {
            clientId,
          },
        },
      },
    }),

    prisma.bed.count({
      where: {
        occupied: true,
        room: {
          facility: {
            clientId,
          },
        },
      },
    }),

    prisma.resident.count({
      where: {
        facility: {
          clientId,
        },
        status: "ACTIVE",
      },
    }),

    prisma.facility.findMany({
      where: {
        clientId,
      },

      select: {
        id: true,
        name: true,
        city: true,
        status: true,

        _count: {
          select: {
            rooms: true,
            residents: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      take: 5,
    }),
  ]);

  const occupationRate =
    bedsCount > 0
      ? Math.round(
          (occupiedBedsCount / bedsCount) * 100
        )
      : 0;

  return (
    <div className="min-w-0 space-y-6">
      {/* Cabeçalho */}
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
              Visão geral
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Bem-vindo, {user.fullName}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Acompanhe os lares, quartos, camas e
              utentes da plataforma CareLux.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
              Organização
            </p>

            <p className="mt-2 text-lg font-semibold">
              {user.client.name}
            </p>

            <p className="mt-1 text-sm text-emerald-100">
              {user.role?.name ?? "Utilizador"}
            </p>
          </div>
        </div>
      </section>

      {/* Indicadores */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link
          href="/dashboard/facilities"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lares
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {facilitiesCount}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Unidades registadas
          </p>
        </Link>

        <Link
          href="/dashboard/rooms"
          className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Quartos
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {roomsCount}
          </p>

          <p className="mt-2 text-xs text-blue-600">
            Quartos disponíveis
          </p>
        </Link>

        <Link
          href="/dashboard/beds"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Camas livres
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {availableBedsCount}
          </p>

          <p className="mt-2 text-xs text-emerald-600">
            De um total de {bedsCount}
          </p>
        </Link>

        <Link
          href="/dashboard/residents"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Utentes ativos
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {activeResidentsCount}
          </p>

          <p className="mt-2 text-xs text-amber-600">
            Atualmente registados
          </p>
        </Link>
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Lares */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Os seus lares
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Resumo das unidades registadas.
              </p>
            </div>

            <Link
              href="/dashboard/facilities"
              className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Ver todos
            </Link>
          </div>

          {facilities.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-semibold text-slate-800">
                Ainda não existem lares
              </p>

              <Link
                href="/dashboard/facilities/new"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white"
              >
                Criar primeiro lar
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {facilities.map((facility) => (
                <Link
                  key={facility.id}
                  href={`/dashboard/facilities/${facility.id}/edit`}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {facility.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {facility.city || "Localidade não indicada"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {facility._count.rooms} quartos
                    </span>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {facility._count.residents} utentes
                    </span>

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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Ocupação e atalhos */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Ocupação
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Estado atual das camas.
            </p>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-bold text-slate-900">
                  {occupationRate}%
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Taxa de ocupação
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-amber-700">
                  {occupiedBedsCount} ocupadas
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  {availableBedsCount} livres
                </p>
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{
                  width: `${occupationRate}%`,
                }}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Ações rápidas
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/facilities/new"
                className="flex min-h-20 flex-col justify-center rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="font-semibold text-slate-900">
                  Novo lar
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Adicionar unidade
                </span>
              </Link>

              <Link
                href="/dashboard/rooms/new"
                className="flex min-h-20 flex-col justify-center rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="font-semibold text-slate-900">
                  Novo quarto
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Associar a um lar
                </span>
              </Link>

              <Link
                href="/dashboard/beds/new"
                className="flex min-h-20 flex-col justify-center rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="font-semibold text-slate-900">
                  Nova cama
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Associar a quarto
                </span>
              </Link>

              <Link
                href="/dashboard/residents"
                className="flex min-h-20 flex-col justify-center rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="font-semibold text-slate-900">
                  Novo utente
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Gerir admissões
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
