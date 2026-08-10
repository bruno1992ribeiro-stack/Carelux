import {
  BedDouble,
  Building2,
  CalendarDays,
  DoorOpen,
} from "lucide-react";
import Link from "next/link";

type ResidentWorkspaceHeaderProps = {
  canEdit: boolean;
  resident: {
    admissionDate: Date | null;
    bed: { identifier: string } | null;
    firstName: string;
    facility: { name: string } | null;
    id: string;
    lastName: string;
    room: { number: string } | null;
    status: string;
  };
};

const dateFormatter = new Intl.DateTimeFormat("pt-PT");

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  HOSPITALIZED: "Hospitalizado",
  DISCHARGED: "Alta",
  DECEASED: "Falecido",
};

const statusClasses: Record<string, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  HOSPITALIZED: "bg-amber-100 text-amber-700",
  DISCHARGED: "bg-blue-100 text-blue-700",
  DECEASED: "bg-muted text-muted-foreground",
};

export function ResidentWorkspaceHeader({
  canEdit,
  resident,
}: ResidentWorkspaceHeaderProps) {
  const information = [
    {
      icon: Building2,
      label: "Unidade",
      value: resident.facility?.name ?? "Sem unidade",
    },
    {
      icon: DoorOpen,
      label: "Quarto",
      value: resident.room?.number ?? "Sem quarto",
    },
    {
      icon: BedDouble,
      label: "Cama",
      value: resident.bed?.identifier ?? "Sem cama",
    },
    {
      icon: CalendarDays,
      label: "Admissão",
      value: resident.admissionDate
        ? dateFormatter.format(resident.admissionDate)
        : "Não indicada",
    },
  ];

  return (
    <header className="card-warm flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Perfil do utente
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 break-words font-display text-3xl leading-9 text-foreground">
              {resident.firstName} {resident.lastName}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusClasses[resident.status] ??
                "bg-muted text-muted-foreground"
              }`}
            >
              {statusLabels[resident.status] ?? resident.status}
            </span>
          </div>
        </div>

        <div className="grid gap-2 sm:flex">
          <Link
            href="/dashboard/residents"
            className="interactive-target inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            Voltar
          </Link>
          {canEdit ? (
            <Link
              href={`/dashboard/residents/${resident.id}/edit`}
              className="interactive-target inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              Editar
            </Link>
          ) : null}
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {information.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background/70 p-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="break-words text-sm font-semibold text-foreground">
                  {item.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </header>
  );
}
