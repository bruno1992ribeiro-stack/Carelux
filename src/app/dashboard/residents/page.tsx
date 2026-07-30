import { prisma } from "@/lib/prisma";
import { getResidentFilter } from "@/lib/residents";

function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Ativo";

    case "HOSPITALIZED":
      return "Hospitalizado";

    case "DISCHARGED":
      return "Alta";

    case "DECEASED":
      return "Falecido";

    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";

    case "HOSPITALIZED":
      return "bg-amber-100 text-amber-700";

    case "DISCHARGED":
      return "bg-blue-100 text-blue-700";

    case "DECEASED":
      return "bg-slate-200 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

const dateFormatter = new Intl.DateTimeFormat("pt-PT");

export default async function ResidentsPage() {
  const filter = await getResidentFilter();

  const residents = await prisma.resident.findMany({
    where: filter,

    include: {
      facility: true,
      room: true,
      bed: true,
    },

    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
  });

  const activeResidents = residents.filter(
    (resident) => resident.status === "ACTIVE"
  ).length;

  const hospitalizedResidents = residents.filter(
    (resident) => resident.status === "HOSPITALIZED"
  ).length;

  const residentsWithoutBed = residents.filter(
    (resident) => !resident.bedId
  ).length;

  return (
    <div className="min-w-0 space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
          Gestão residencial
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Utentes
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Consulte os utentes registados nos seus lares.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {residents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Ativos
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {activeResidents}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Hospitalizados
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {hospitalizedResidents}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Sem cama
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {residentsWithoutBed}
          </p>
        </div>
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
            O próximo passo será criar o formulário de admissão de utentes.
          </p>
        </section>
      ) : (
        <>
          {/* Telemóvel */}
          <section className="grid gap-4 md:hidden">
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

                  <span
                    className={[
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      getStatusClasses(resident.status),
                    ].join(" ")}
                  >
                    {getStatusLabel(resident.status)}
                  </span>
                </div>

                <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-slate-500">
                      Quarto
                    </dt>

                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {resident.room?.number ?? "Não atribuído"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-slate-500">
                      Cama
                    </dt>

                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {resident.bed?.identifier ?? "Não atribuída"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-slate-500">
                      Admissão
                    </dt>

                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {resident.admissionDate
                        ? dateFormatter.format(resident.admissionDate)
                        : "Não indicada"}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>

          {/* Tablet e computador */}
          <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Utente
                    </th>

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
                      Admissão
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {residents.map((resident) => (
                    <tr
                      key={resident.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {resident.firstName} {resident.lastName}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {resident.facility.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {resident.room?.number ?? "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {resident.bed?.identifier ?? "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {resident.admissionDate
                          ? dateFormatter.format(resident.admissionDate)
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            getStatusClasses(resident.status),
                          ].join(" ")}
                        >
                          {getStatusLabel(resident.status)}
                        </span>
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