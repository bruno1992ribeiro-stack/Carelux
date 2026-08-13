import {
  MedicationCareMoment,
  MedicationScheduleMode,
  MedicationStatus,
  MedicationWeekday,
} from "@prisma/client";
import {
  Archive,
  CalendarRange,
  Clock3,
  PauseCircle,
  Pill,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/carelux-ui";
import { ResidentSectionEmptyState } from "@/components/dashboard/residents/resident-section-empty-state";
import { cn } from "@/lib/utils";
import type { getResidentMedications } from "@/modules/resident-medications/server/get-resident-medications";

import { ChangeMedicationScheduleDialog } from "./change-medication-schedule-dialog";
import { CreateMedicationDialog } from "./create-medication-dialog";
import { EditMedicationDialog } from "./edit-medication-dialog";
import { MedicationStatusActions } from "./medication-status-action-dialog";

type MedicationData = Awaited<ReturnType<typeof getResidentMedications>>;
type Medication = MedicationData["medications"][number];

type ResidentMedicationsProps = {
  residentId: string;
  medications: MedicationData["medications"];
  canEdit: boolean;
};

type MedicationGroupProps = {
  canEdit: boolean;
  description: string;
  emptyMessage: string;
  eyebrow: string;
  icon: typeof Pill;
  id: string;
  medications: Medication[];
  residentId: string;
  title: string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const statusLabels: Record<MedicationStatus, string> = {
  ACTIVE: "Ativa",
  SUSPENDED: "Suspensa",
  DISCONTINUED: "Descontinuada",
};

const careMomentLabels: Record<MedicationCareMoment, string> = {
  BREAKFAST: "Pequeno-almoço",
  LUNCH: "Almoço",
  DINNER: "Jantar",
  BEDTIME: "Ao deitar",
};

const weekdayLabels: Record<MedicationWeekday, string> = {
  MONDAY: "Seg",
  TUESDAY: "Ter",
  WEDNESDAY: "Qua",
  THURSDAY: "Qui",
  FRIDAY: "Sex",
  SATURDAY: "Sáb",
  SUNDAY: "Dom",
};

function formatTimeOfDay(value: Date | null) {
  if (!value) return null;

  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function weekdaysSummary(weekdays: MedicationWeekday[]) {
  if (!weekdays.length) return "";
  return ` · ${weekdays.map((weekday) => weekdayLabels[weekday]).join(", ")}`;
}

function occurrenceLabel(
  occurrence: Medication["scheduleRules"][number]["occurrences"][number],
) {
  const timing = occurrence.timeOfDay
    ? formatTimeOfDay(occurrence.timeOfDay)
    : occurrence.careMoment
      ? careMomentLabels[occurrence.careMoment]
      : null;

  if (!timing) return null;
  return occurrence.doseOverride
    ? `${timing} (${occurrence.doseOverride})`
    : timing;
}

function scheduleRuleSummary(
  rule: Medication["scheduleRules"][number],
): string | null {
  let summary: string;

  switch (rule.mode) {
    case MedicationScheduleMode.DAILY_FREQUENCY:
      if (rule.timesPerDay === null) return null;
      summary = `${rule.timesPerDay} ${rule.timesPerDay === 1 ? "toma" : "tomas"} por dia`;
      break;
    case MedicationScheduleMode.FIXED_TIMES: {
      if (
        !rule.occurrences.length ||
        rule.occurrences.some((occurrence) => !occurrence.timeOfDay)
      ) {
        return null;
      }

      const occurrences = rule.occurrences
        .map(occurrenceLabel)
        .filter((label): label is string => Boolean(label));
      summary = occurrences.join(" · ");
      break;
    }
    case MedicationScheduleMode.CARE_MOMENTS: {
      if (
        !rule.occurrences.length ||
        rule.occurrences.some((occurrence) => !occurrence.careMoment)
      ) {
        return null;
      }

      const occurrences = rule.occurrences
        .map(occurrenceLabel)
        .filter((label): label is string => Boolean(label));
      summary = occurrences.join(" · ");
      break;
    }
    case MedicationScheduleMode.INTERVAL:
      if (rule.intervalHours === null) return null;
      summary = `A cada ${rule.intervalHours} ${rule.intervalHours === 1 ? "hora" : "horas"}`;
      break;
    case MedicationScheduleMode.PRN:
      if (!rule.prnReason?.trim()) return null;
      summary = `SOS — ${rule.prnReason}`;
      break;
  }

  return `${summary}${weekdaysSummary(rule.weekdays)}`;
}

function SchedulePresentation({ medication }: { medication: Medication }) {
  if (medication.scheduleRules.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Esquema posológico não disponível.
      </p>
    );
  }

  if (medication.scheduleRules.length > 1) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Esquema posológico inconsistente.
      </p>
    );
  }

  const rule = medication.scheduleRules[0];
  const summary = scheduleRuleSummary(rule);

  if (!summary) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Esquema posológico incompleto.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-sm font-semibold text-foreground">{summary}</p>
      {rule.instructions && (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {rule.instructions}
        </p>
      )}
    </div>
  );
}

function StatusMark({ status }: { status: MedicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        status === MedicationStatus.ACTIVE && "bg-primary/10 text-primary",
        status === MedicationStatus.SUSPENDED &&
          "bg-secondary/20 text-foreground",
        status === MedicationStatus.DISCONTINUED &&
          "bg-muted text-muted-foreground",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function MedicationCard({
  canEdit,
  medication,
  residentId,
}: {
  canEdit: boolean;
  medication: Medication;
  residentId: string;
}) {
  const canChange =
    canEdit && medication.status !== MedicationStatus.DISCONTINUED;

  return (
    <li>
      <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm sm:p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pill aria-hidden="true" size={20} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground">
                {medication.medicationName}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {medication.dosage} · {medication.pharmaceuticalForm} ·{" "}
                {medication.administrationRoute}
              </p>
            </div>
          </div>
          <StatusMark status={medication.status} />
        </header>

        <div className="rounded-xl bg-primary/5 px-3.5 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <Clock3 aria-hidden="true" size={15} strokeWidth={1.8} />
            Esquema posológico
          </div>
          <SchedulePresentation medication={medication} />
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <UserRound
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-muted-foreground"
              size={16}
              strokeWidth={1.8}
            />
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">
                Prescritor
              </dt>
              <dd className="mt-0.5 text-foreground">
                {medication.prescriberName}
              </dd>
            </div>
          </div>
          <div className="flex gap-2">
            <CalendarRange
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-muted-foreground"
              size={16}
              strokeWidth={1.8}
            />
            <div>
              <dt className="text-xs font-semibold text-muted-foreground">
                Período
              </dt>
              <dd className="mt-0.5 text-foreground">
                {dateFormatter.format(medication.startDate)}
                {medication.endDate
                  ? ` a ${dateFormatter.format(medication.endDate)}`
                  : " · sem data de fim"}
              </dd>
            </div>
          </div>
        </dl>

        {(medication.indication || medication.observations) && (
          <div className="flex flex-col gap-2 border-t border-border/70 pt-4 text-sm">
            {medication.indication && (
              <p className="leading-5 text-foreground">
                <span className="font-semibold">Indicação:</span>{" "}
                {medication.indication}
              </p>
            )}
            {medication.observations && (
              <p className="whitespace-pre-wrap leading-5 text-muted-foreground">
                {medication.observations}
              </p>
            )}
          </div>
        )}
        {canChange && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
            <div className="flex flex-wrap gap-2">
              <EditMedicationDialog
                key={`${medication.id}-${medication.updatedAt.toISOString()}`}
                medication={medication}
                residentId={residentId}
              />
              <ChangeMedicationScheduleDialog
                medication={medication}
                residentId={residentId}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <MedicationStatusActions
                medicationId={medication.id}
                residentId={residentId}
                status={medication.status}
              />
            </div>
          </div>
        )}
      </article>
    </li>
  );
}

function MedicationGroup({
  canEdit,
  description,
  emptyMessage,
  eyebrow,
  icon: Icon,
  id,
  medications,
  residentId,
  title,
}: MedicationGroupProps) {
  return (
    <section aria-labelledby={id}>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {eyebrow}
              </p>
              <CardTitle id={id} className="mt-1">
                {title}
              </CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {medications.length ? (
            <ul className="grid gap-4 xl:grid-cols-2">
              {medications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  canEdit={canEdit}
                  residentId={residentId}
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export function ResidentMedications({
  canEdit,
  medications,
  residentId,
}: ResidentMedicationsProps) {
  const active = medications.filter(
    (medication) => medication.status === MedicationStatus.ACTIVE,
  );
  const suspended = medications.filter(
    (medication) => medication.status === MedicationStatus.SUSPENDED,
  );
  const discontinued = medications.filter(
    (medication) => medication.status === MedicationStatus.DISCONTINUED,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Plano terapêutico
          </p>
          <h2 className="mt-1 font-display text-xl text-foreground">
            Medicação do utente
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Prescrições e esquemas posológicos associados ao utente.
          </p>
        </div>
        {canEdit && <CreateMedicationDialog residentId={residentId} />}
      </div>

      {!medications.length ? (
        <ResidentSectionEmptyState
          icon={Pill}
          title="Ainda não existe medicação associada"
          description="As prescrições do utente e os respetivos esquemas posológicos serão apresentados aqui."
        />
      ) : (
        <>
          <MedicationGroup
            id="active-medications-title"
            eyebrow="Plano atual"
            title="Medicação ativa"
            description="Prescrições atualmente em vigor para o utente."
            emptyMessage="Não existe medicação ativa."
            icon={Pill}
            medications={active}
            canEdit={canEdit}
            residentId={residentId}
          />
          {suspended.length > 0 && (
            <MedicationGroup
              id="suspended-medications-title"
              eyebrow="Em pausa"
              title="Medicação suspensa"
              description="Prescrições temporariamente suspensas."
              emptyMessage="Não existe medicação suspensa."
              icon={PauseCircle}
              medications={suspended}
              canEdit={canEdit}
              residentId={residentId}
            />
          )}
          {discontinued.length > 0 && (
            <MedicationGroup
              id="medication-history-title"
              eyebrow="Percurso terapêutico"
              title="Histórico"
              description="Medicação descontinuada, preservada para consulta."
              emptyMessage="Ainda não existe medicação no histórico."
              icon={Archive}
              medications={discontinued}
              canEdit={canEdit}
              residentId={residentId}
            />
          )}
        </>
      )}
    </div>
  );
}
