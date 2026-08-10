import type { Gender, ResidentStatus } from "@prisma/client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/carelux-ui";

type ResidentSummaryProps = {
  details: {
    contacts: Array<{
      email: string | null;
      fullName: string;
      id: string;
      isPrimary: boolean;
      phone: string | null;
      relationship: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  resident: {
    admissionDate: Date | null;
    bed: { identifier: string } | null;
    birthDate: Date | null;
    facility: { name: string } | null;
    gender: Gender | null;
    room: { number: string } | null;
    status: ResidentStatus;
  };
};

const dateFormatter = new Intl.DateTimeFormat("pt-PT");
const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
});

const genderLabels: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

const statusLabels: Record<ResidentStatus, string> = {
  ACTIVE: "Ativo",
  HOSPITALIZED: "Hospitalizado",
  DISCHARGED: "Alta",
  DECEASED: "Falecido",
};

export function ResidentSummary({ details, resident }: ResidentSummaryProps) {
  const personalDetails = [
    ["Estado", statusLabels[resident.status]],
    [
      "Data de nascimento",
      resident.birthDate
        ? dateFormatter.format(resident.birthDate)
        : "Não indicada",
    ],
    [
      "Género",
      resident.gender ? genderLabels[resident.gender] : "Não indicado",
    ],
    [
      "Data de admissão",
      resident.admissionDate
        ? dateFormatter.format(resident.admissionDate)
        : "Não indicada",
    ],
  ] as const;
  const locationDetails = [
    ["Unidade", resident.facility?.name ?? "Sem unidade"],
    ["Quarto", resident.room?.number ?? "Sem quarto"],
    ["Cama", resident.bed?.identifier ?? "Sem cama"],
  ] as const;

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            {personalDetails.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-background/70 p-4"
              >
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alojamento</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3">
            {locationDetails.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-background/70 p-4"
              >
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Contactos</CardTitle>
        </CardHeader>
        <CardContent>
          {details.contacts.length > 0 ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {details.contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="rounded-xl border border-border bg-background/70 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {contact.fullName}
                    </p>
                    {contact.isPrimary ? (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        Principal
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {contact.relationship}
                  </p>
                  {contact.phone ? (
                    <p className="mt-2 break-words text-sm text-foreground">
                      {contact.phone}
                    </p>
                  ) : null}
                  {contact.email ? (
                    <p className="mt-1 break-words text-sm text-foreground">
                      {contact.email}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Não existem contactos associados a este utente.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Informação do registo</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/70 p-4">
              <dt className="text-xs text-muted-foreground">Criado em</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {dateTimeFormatter.format(details.createdAt)}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-background/70 p-4">
              <dt className="text-xs text-muted-foreground">Atualizado em</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {dateTimeFormatter.format(details.updatedAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
