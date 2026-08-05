import Link from "next/link";
import { notFound } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { getCurrentClientUser } from "@/lib/session";
import { DeleteResidentButton } from "@/modules/residents/components/delete-resident-button";
import { residentService } from "@/modules/residents/services/resident.service";

const dateFormatter = new Intl.DateTimeFormat("pt-PT");
const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  HOSPITALIZED: "Hospitalizado",
  DISCHARGED: "Alta",
  DECEASED: "Falecido",
};

const genderLabels: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

export default async function ResidentDetailsPage({
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

  const details = [
    ["Estado", statusLabels[resident.status] ?? resident.status],
    ["Nascimento", resident.birthDate ? dateFormatter.format(resident.birthDate) : "Não indicado"],
    ["Género", resident.gender ? genderLabels[resident.gender] ?? resident.gender : "Não indicado"],
    ["Admissão", resident.admissionDate ? dateFormatter.format(resident.admissionDate) : "Não indicada"],
    ["Lar", resident.facility.name],
    ["Quarto", resident.room?.number ?? "Não atribuído"],
    ["Cama", resident.bed?.identifier ?? "Não atribuída"],
    ["Criado em", dateTimeFormatter.format(resident.createdAt)],
    ["Atualizado em", dateTimeFormatter.format(resident.updatedAt)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Utente
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {resident.firstName} {resident.lastName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Ficha de identificação e alojamento.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link
            href="/dashboard/residents"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </Link>
          <Link
            href={`/dashboard/residents/${resident.id}/edit`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Editar
          </Link>
          <div className="col-span-2">
            <DeleteResidentButton residentId={resident.id} redirectAfterDelete />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <dl className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
