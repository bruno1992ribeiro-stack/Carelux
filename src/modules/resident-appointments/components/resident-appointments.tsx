import {
  AppointmentRevisionType,
  AppointmentStatus,
} from "@prisma/client";
import {
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  History,
  MapPin,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/carelux-ui";
import type { getResidentAppointments } from "@/modules/resident-appointments/server/get-resident-appointments";

import {
  AppointmentDialog,
  RescheduleAppointmentDialog,
} from "./appointment-forms";
import {
  CancelAppointmentDialog,
  CompleteAppointmentDialog,
  CorrectAppointmentStatusDialog,
  ReopenAppointmentDialog,
} from "./appointment-status-actions";

type AppointmentData = Awaited<ReturnType<typeof getResidentAppointments>>;
type Appointment = AppointmentData["upcoming"][number];
type ResidentAppointmentsProps = AppointmentData & { residentId: string };

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
});
const timeFormatter = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabels: Record<AppointmentStatus, string> = {
  CANCELLED: "Cancelada",
  COMPLETED: "Realizada",
  SCHEDULED: "Agendada",
};

const revisionLabels: Record<AppointmentRevisionType, string> = {
  CANCELLED: "Cancelamento",
  COMPLETED: "Realização",
  EDITED: "Edição",
  REOPENED: "Reabertura",
  RESCHEDULED: "Reagendamento",
  STATUS_CORRECTED: "Correção de estado",
};

function StatusMark({ status }: { status: AppointmentStatus }) {
  const Icon =
    status === AppointmentStatus.SCHEDULED
      ? Clock3
      : status === AppointmentStatus.COMPLETED
        ? CheckCircle2
        : CalendarX2;

  return (
    <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
      <Icon aria-hidden="true" size={14} strokeWidth={2} />
      {statusLabels[status]}
    </span>
  );
}

function MetaItem({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: typeof MapPin;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
      {children}
    </span>
  );
}

function RevisionHistory({ appointment }: { appointment: Appointment }) {
  if (!appointment.revisions.length) return null;

  return (
    <details className="group rounded-xl border border-border bg-card/60">
      <summary className="interactive-target flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground marker:content-none">
        <span className="inline-flex items-center gap-2">
          <History aria-hidden="true" size={17} />
          Ver histórico ({appointment.revisions.length})
        </span>
        <ChevronDown
          aria-hidden="true"
          size={17}
          className="transition-transform group-open:rotate-180"
        />
      </summary>
      <ol className="flex flex-col gap-0 border-t border-border px-4">
        {appointment.revisions.map((revision) => (
          <li
            key={revision.id}
            className="flex flex-col gap-2 border-b border-border/70 py-4 last:border-0"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <strong className="text-sm text-foreground">
                {revisionLabels[revision.changeType]}
              </strong>
              <time className="text-xs text-muted-foreground">
                {dateTimeFormatter.format(revision.changedAt)}
              </time>
            </div>
            <p className="text-xs text-muted-foreground">
              Alterado por {revision.changedBy.fullName}. Snapshot anterior: {statusLabels[revision.status]}, {dateTimeFormatter.format(revision.scheduledAt)}.
            </p>
            <dl className="grid gap-x-5 gap-y-1 text-xs sm:grid-cols-2">
              <div className="flex gap-1">
                <dt className="font-semibold text-foreground">Consulta:</dt>
                <dd className="text-muted-foreground">
                  {revision.type}{revision.specialty ? ` · ${revision.specialty}` : ""}
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="font-semibold text-foreground">Profissional:</dt>
                <dd className="text-muted-foreground">{revision.professionalName}</dd>
              </div>
              {revision.location && (
                <div className="flex gap-1">
                  <dt className="font-semibold text-foreground">Local:</dt>
                  <dd className="text-muted-foreground">{revision.location}</dd>
                </div>
              )}
              {revision.changeReason && (
                <div className="flex gap-1">
                  <dt className="font-semibold text-foreground">Motivo:</dt>
                  <dd className="text-muted-foreground">{revision.changeReason}</dd>
                </div>
              )}
              {revision.cancellationReason && (
                <div className="flex gap-1 sm:col-span-2">
                  <dt className="font-semibold text-foreground">Cancelamento:</dt>
                  <dd className="text-muted-foreground">
                    {revision.cancellationReason}
                  </dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ol>
    </details>
  );
}

function AppointmentCard({
  appointment,
  canEdit,
  residentId,
}: {
  appointment: Appointment;
  canEdit: boolean;
  residentId: string;
}) {
  const scheduled = appointment.status === AppointmentStatus.SCHEDULED;

  return (
    <li>
      <article className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex shrink-0 items-center gap-3 rounded-xl bg-primary/8 px-3 py-2.5 sm:w-28 sm:flex-col sm:items-start sm:gap-0">
            <span className="text-sm font-semibold text-foreground">
              {dateFormatter.format(appointment.scheduledAt)}
            </span>
            <span className="font-display text-xl text-primary">
              {timeFormatter.format(appointment.scheduledAt)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{appointment.type}</h3>
                {appointment.specialty && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {appointment.specialty}
                  </p>
                )}
              </div>
              <StatusMark status={appointment.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              <MetaItem icon={UserRound}>{appointment.professionalName}</MetaItem>
              {appointment.location && (
                <MetaItem icon={MapPin}>{appointment.location}</MetaItem>
              )}
              <MetaItem icon={Stethoscope}>{appointment.facility.name}</MetaItem>
            </div>
            {appointment.reason && (
              <p className="mt-3 text-sm leading-5 text-foreground">
                <span className="font-semibold">Motivo:</span> {appointment.reason}
              </p>
            )}
            {appointment.observations && (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-muted-foreground">
                {appointment.observations}
              </p>
            )}
            {appointment.status === AppointmentStatus.CANCELLED &&
              appointment.cancellationReason && (
                <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
                  <span className="font-semibold">Motivo do cancelamento:</span>{" "}
                  {appointment.cancellationReason}
                </p>
              )}
            {canEdit && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
                {scheduled ? (
                  <>
                    <AppointmentDialog appointment={appointment} residentId={residentId} />
                    <RescheduleAppointmentDialog
                      appointment={appointment}
                      residentId={residentId}
                    />
                    <CompleteAppointmentDialog
                      appointmentId={appointment.id}
                      residentId={residentId}
                    />
                    <CancelAppointmentDialog
                      appointmentId={appointment.id}
                      residentId={residentId}
                    />
                  </>
                ) : (
                  <>
                    <ReopenAppointmentDialog
                      appointmentId={appointment.id}
                      residentId={residentId}
                    />
                    <CorrectAppointmentStatusDialog
                      appointmentId={appointment.id}
                      currentStatus={
                        appointment.status === AppointmentStatus.COMPLETED
                          ? AppointmentStatus.COMPLETED
                          : AppointmentStatus.CANCELLED
                      }
                      residentId={residentId}
                    />
                  </>
                )}
              </div>
            )}
            <div className="mt-4">
              <RevisionHistory appointment={appointment} />
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}

function EmptyAppointments({ history = false }: { history?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-5 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <CalendarClock aria-hidden="true" size={24} />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {history ? "Sem consultas no histórico" : "Sem próximas consultas"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {history
            ? "As consultas realizadas e canceladas aparecem aqui."
            : "As consultas agendadas aparecem aqui por ordem cronológica."}
        </p>
      </div>
    </div>
  );
}

export function ResidentAppointments({
  authorization,
  history,
  residentId,
  upcoming,
}: ResidentAppointmentsProps) {
  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="upcoming-appointments-title">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Agenda do utente
                </p>
                <CardTitle id="upcoming-appointments-title" className="mt-1">
                  Próximas consultas
                </CardTitle>
                <CardDescription className="mt-1">
                  Consultas agendadas por ordem cronológica.
                </CardDescription>
              </div>
              {authorization.canEdit && <AppointmentDialog residentId={residentId} />}
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.length ? (
              <ul className="grid gap-4 xl:grid-cols-2">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    canEdit={authorization.canEdit}
                    residentId={residentId}
                  />
                ))}
              </ul>
            ) : (
              <EmptyAppointments />
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="appointment-history-title">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Percurso assistencial
            </p>
            <CardTitle id="appointment-history-title" className="mt-1">
              Histórico
            </CardTitle>
            <CardDescription className="mt-1">
              Consultas realizadas e canceladas, mais recentes primeiro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length ? (
              <ul className="grid gap-4 xl:grid-cols-2">
                {history.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    canEdit={authorization.canEdit}
                    residentId={residentId}
                  />
                ))}
              </ul>
            ) : (
              <EmptyAppointments history />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
