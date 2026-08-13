"use client";

import {
  MedicationCareMoment,
  MedicationRevisionType,
  MedicationScheduleMode,
  MedicationStatus,
  MedicationWeekday,
} from "@prisma/client";
import { History, MapPin, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/carelux-ui";
import { getMedicationRevisions } from "@/modules/resident-medications/server/get-medication-revisions";

type Revision = Awaited<ReturnType<typeof getMedicationRevisions>>[number];

const secondaryActionClass =
  "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";

const revisionLabels: Record<MedicationRevisionType, string> = {
  EDITED: "Dados da prescrição alterados",
  SCHEDULE_CHANGED: "Esquema posológico alterado",
  SUSPENDED: "Medicação suspensa",
  REACTIVATED: "Medicação reativada",
  DISCONTINUED: "Medicação descontinuada",
  STATUS_CORRECTED: "Estado da medicação corrigido",
};

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

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
});

const positiveInteger = z.number().int().positive();
const timeOfDay = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const scheduleOccurrenceSchema = z
  .object({
    timeOfDay: timeOfDay.nullable(),
    careMoment: z.enum(MedicationCareMoment).nullable(),
    doseOverride: z.string().nullable(),
    position: z.number().int().nonnegative(),
  })
  .passthrough();

const scheduleSnapshotSchema = z
  .object({
    version: z.literal(1),
    mode: z.enum(MedicationScheduleMode),
    timesPerDay: positiveInteger.nullable(),
    intervalHours: positiveInteger.nullable(),
    weekdays: z.array(z.enum(MedicationWeekday)),
    prnReason: z.string().nullable(),
    maxDosesPerDay: positiveInteger.nullable(),
    minimumIntervalHours: positiveInteger.nullable(),
    instructions: z.string().nullable(),
    occurrences: z.array(scheduleOccurrenceSchema),
  })
  .passthrough()
  .superRefine((snapshot, context) => {
    switch (snapshot.mode) {
      case MedicationScheduleMode.DAILY_FREQUENCY:
        if (snapshot.timesPerDay === null) {
          context.addIssue({ code: "custom", path: ["timesPerDay"] });
        }
        break;
      case MedicationScheduleMode.FIXED_TIMES:
        if (
          !snapshot.occurrences.length ||
          snapshot.occurrences.some((occurrence) => !occurrence.timeOfDay)
        ) {
          context.addIssue({ code: "custom", path: ["occurrences"] });
        }
        break;
      case MedicationScheduleMode.CARE_MOMENTS:
        if (
          !snapshot.occurrences.length ||
          snapshot.occurrences.some((occurrence) => !occurrence.careMoment)
        ) {
          context.addIssue({ code: "custom", path: ["occurrences"] });
        }
        break;
      case MedicationScheduleMode.INTERVAL:
        if (snapshot.intervalHours === null) {
          context.addIssue({ code: "custom", path: ["intervalHours"] });
        }
        break;
      case MedicationScheduleMode.PRN:
        if (!snapshot.prnReason?.trim()) {
          context.addIssue({ code: "custom", path: ["prnReason"] });
        }
        break;
    }
  });

type ScheduleSnapshot = z.infer<typeof scheduleSnapshotSchema>;

function parseScheduleSnapshot(revision: Revision) {
  if (revision.scheduleSnapshotVersion !== 1) {
    return null;
  }

  const result = scheduleSnapshotSchema.safeParse(revision.scheduleSnapshot);
  return result.success ? result.data : null;
}

function weekdaySummary(weekdays: MedicationWeekday[]) {
  if (!weekdays.length) {
    return "Todos os dias";
  }

  return weekdays.map((weekday) => weekdayLabels[weekday]).join(", ");
}

function scheduleSummary(snapshot: ScheduleSnapshot) {
  const occurrences = [...snapshot.occurrences].sort(
    (left, right) => left.position - right.position,
  );

  switch (snapshot.mode) {
    case MedicationScheduleMode.DAILY_FREQUENCY:
      return snapshot.timesPerDay === null
        ? null
        : `${snapshot.timesPerDay} ${snapshot.timesPerDay === 1 ? "toma" : "tomas"} por dia`;
    case MedicationScheduleMode.FIXED_TIMES:
      return occurrences.every((occurrence) => occurrence.timeOfDay)
        ? occurrences
            .map((occurrence) =>
              occurrence.doseOverride
                ? `${occurrence.timeOfDay} (${occurrence.doseOverride})`
                : occurrence.timeOfDay,
            )
            .join(" · ")
        : null;
    case MedicationScheduleMode.CARE_MOMENTS:
      return occurrences.every((occurrence) => occurrence.careMoment)
        ? occurrences
            .map((occurrence) => {
              const moment = occurrence.careMoment
                ? careMomentLabels[occurrence.careMoment]
                : null;
              return occurrence.doseOverride
                ? `${moment} (${occurrence.doseOverride})`
                : moment;
            })
            .join(" · ")
        : null;
    case MedicationScheduleMode.INTERVAL:
      return snapshot.intervalHours === null
        ? null
        : `A cada ${snapshot.intervalHours} ${snapshot.intervalHours === 1 ? "hora" : "horas"}`;
    case MedicationScheduleMode.PRN: {
      if (!snapshot.prnReason?.trim()) {
        return null;
      }

      const limits = [
        snapshot.maxDosesPerDay
          ? `máximo ${snapshot.maxDosesPerDay} tomas/dia`
          : null,
        snapshot.minimumIntervalHours
          ? `intervalo mínimo ${snapshot.minimumIntervalHours} h`
          : null,
      ].filter((value): value is string => Boolean(value));

      return `SOS — ${snapshot.prnReason}${limits.length ? ` (${limits.join("; ")})` : ""}`;
    }
  }
}

function PreviousSchedule({ revision }: { revision: Revision }) {
  const snapshot = parseScheduleSnapshot(revision);
  const summary = snapshot ? scheduleSummary(snapshot) : null;

  if (!snapshot || !summary) {
    return (
      <p className="text-sm text-muted-foreground">
        Esquema anterior indisponível.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="font-medium text-foreground">{summary}</p>
      <p className="text-xs text-muted-foreground">
        {weekdaySummary(snapshot.weekdays)}
      </p>
      {snapshot.instructions?.trim() && (
        <p className="whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
          {snapshot.instructions}
        </p>
      )}
    </div>
  );
}

function SnapshotItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm text-foreground">{value}</dd>
    </div>
  );
}

function RevisionItem({ revision }: { revision: Revision }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">
            {revisionLabels[revision.changeType]}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UserRound aria-hidden="true" size={14} strokeWidth={1.8} />
              {revision.changedBy.fullName}
              {revision.changedBy.role?.name
                ? ` · ${revision.changedBy.role.name}`
                : ""}
            </span>
            {revision.changedAtFacility && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" size={14} strokeWidth={1.8} />
                {revision.changedAtFacility.name}
              </span>
            )}
          </div>
        </div>
        <time className="shrink-0 text-xs text-muted-foreground">
          {dateTimeFormatter.format(revision.changedAt)}
        </time>
      </div>

      {revision.changeReason?.trim() && (
        <p className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
          <span className="font-semibold">Motivo:</span> {revision.changeReason}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-border/70 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Estado anterior
        </p>
        <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
          <SnapshotItem label="Medicamento" value={revision.medicationName} />
          <SnapshotItem label="Estado" value={statusLabels[revision.status]} />
          <SnapshotItem label="Dosagem" value={revision.dosage} />
          <SnapshotItem
            label="Forma farmacêutica"
            value={revision.pharmaceuticalForm}
          />
          <SnapshotItem
            label="Via de administração"
            value={revision.administrationRoute}
          />
          <SnapshotItem label="Prescritor" value={revision.prescriberName} />
          <SnapshotItem
            label="Data de início"
            value={dateFormatter.format(revision.startDate)}
          />
          <SnapshotItem
            label="Data de fim"
            value={
              revision.endDate ? dateFormatter.format(revision.endDate) : null
            }
          />
          <SnapshotItem label="Indicação" value={revision.indication} />
          <SnapshotItem label="Observações" value={revision.observations} />
        </dl>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/70 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Esquema anterior
        </p>
        <PreviousSchedule revision={revision} />
      </div>
    </li>
  );
}

export function MedicationHistoryDialog({
  medicationId,
  medicationName,
  residentId,
}: {
  medicationId: string;
  medicationName: string;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  async function loadRevisions() {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMedicationRevisions(residentId, medicationId);
      setRevisions(result);
    } catch {
      setError("Não foi possível carregar o histórico da medicação.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen && revisions === null) {
      void loadRevisions();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <History aria-hidden="true" data-icon="inline-start" />
        Histórico
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl"
        aria-describedby={`medication-history-description-${medicationId}`}
      >
        <DialogHeader>
          <DialogTitle>Histórico da medicação</DialogTitle>
          <p
            id={`medication-history-description-${medicationId}`}
            className="text-sm text-muted-foreground"
          >
            Alterações registadas para {medicationName}. Cada entrada apresenta
            o estado anterior à alteração.
          </p>
        </DialogHeader>

        {isLoading && revisions === null ? (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            A carregar histórico...
          </p>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
            <Button
              className={secondaryActionClass}
              disabled={isLoading}
              onClick={() => void loadRevisions()}
            >
              {isLoading ? "A tentar novamente..." : "Tentar novamente"}
            </Button>
          </div>
        ) : revisions?.length ? (
          <ol className="flex flex-col gap-3">
            {revisions.map((revision) => (
              <RevisionItem key={revision.id} revision={revision} />
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
            Ainda não existem alterações registadas para esta medicação.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
