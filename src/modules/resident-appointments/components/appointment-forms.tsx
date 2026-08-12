"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Clock3, PencilLine } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/carelux-ui";

import {
  createAppointment,
  editAppointment,
  rescheduleAppointment,
} from "../actions";
import {
  appointmentCreateSchema,
  appointmentRescheduleSchema,
} from "../schemas/resident-appointment.schema";

const initialState = { success: false, message: "" };
const secondaryActionClass =
  "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";

type AppointmentEditable = {
  id: string;
  location: string | null;
  observations: string | null;
  professionalName: string;
  reason: string | null;
  scheduledAt: Date;
  specialty: string | null;
  type: string;
};

const schedulingFieldsSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Indique a data da consulta."),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Indique a hora da consulta."),
});

const appointmentFormSchema = appointmentCreateSchema
  .omit({ scheduledAt: true })
  .extend(schedulingFieldsSchema.shape);

const rescheduleFormSchema = appointmentRescheduleSchema
  .omit({ scheduledAt: true })
  .extend(schedulingFieldsSchema.shape);

function schedulingFields(value?: Date) {
  if (!value) {
    return { appointmentDate: "", appointmentTime: "" };
  }

  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  const dateTime = local.toISOString();
  return {
    appointmentDate: dateTime.slice(0, 10),
    appointmentTime: dateTime.slice(11, 16),
  };
}

function scheduledAt(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function RootError({ message }: { message?: string }) {
  return message ? (
    <p
      role="alert"
      className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </p>
  ) : null;
}

function addValues(formData: FormData, values: Record<string, unknown>) {
  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value === null || value === undefined ? "" : String(value));
  });
}

type AppointmentFormValues = z.input<typeof appointmentFormSchema>;

export function AppointmentDialog({
  appointment,
  residentId,
}: {
  appointment?: AppointmentEditable;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      ...schedulingFields(appointment?.scheduledAt),
      location: appointment?.location ?? "",
      observations: appointment?.observations ?? "",
      professionalName: appointment?.professionalName ?? "",
      reason: appointment?.reason ?? "",
      responsibleUserId: null,
      specialty: appointment?.specialty ?? "",
      type: appointment?.type ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    const { appointmentDate, appointmentTime, ...appointmentValues } = values;
    addValues(formData, appointmentValues as Record<string, unknown>);
    formData.set("scheduledAt", scheduledAt(appointmentDate, appointmentTime));
    const result = appointment
      ? await editAppointment(residentId, appointment.id, initialState, formData)
      : await createAppointment(residentId, initialState, formData);

    if (!result.success) {
      Object.entries(result.errors ?? {}).forEach(([key, messages]) => {
        setError(key as keyof AppointmentFormValues, { message: messages[0] });
      });
      setError("root", { message: result.message });
      return;
    }

    setOpen(false);
    if (!appointment) reset();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className={appointment ? secondaryActionClass : undefined} />
        }
      >
        {appointment ? (
          <>
            <PencilLine aria-hidden="true" data-icon="inline-start" /> Editar
          </>
        ) : (
          <>
            <CalendarPlus aria-hidden="true" data-icon="inline-start" /> Nova consulta
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar consulta" : "Nova consulta"}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-5" noValidate onSubmit={submit}>
          <RootError message={errors.root?.message} />
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.appointmentDate)}>
                <FieldLabel htmlFor={`appointment-date-${appointment?.id ?? "new"}`}>
                  Data da consulta
                </FieldLabel>
                <Input
                  id={`appointment-date-${appointment?.id ?? "new"}`}
                  type="date"
                  required
                  readOnly={Boolean(appointment)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.appointmentDate)}
                  {...register("appointmentDate")}
                />
                {errors.appointmentDate && (
                  <FieldError errors={[errors.appointmentDate]} />
                )}
              </Field>
              <Field data-invalid={Boolean(errors.appointmentTime)}>
                <FieldLabel htmlFor={`appointment-time-${appointment?.id ?? "new"}`}>
                  Hora da consulta
                </FieldLabel>
                <Input
                  id={`appointment-time-${appointment?.id ?? "new"}`}
                  type="time"
                  required
                  readOnly={Boolean(appointment)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.appointmentTime)}
                  {...register("appointmentTime")}
                />
                {errors.appointmentTime && (
                  <FieldError errors={[errors.appointmentTime]} />
                )}
              </Field>
            </div>
            {appointment && (
              <p className="text-xs text-muted-foreground">
                Para alterar a data ou a hora, use a ação Reagendar.
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.type)}>
                <FieldLabel htmlFor="appointment-type">Tipo</FieldLabel>
                <Input
                  id="appointment-type"
                  placeholder="Ex.: Consulta médica"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.type)}
                  {...register("type")}
                />
                {errors.type && <FieldError errors={[errors.type]} />}
              </Field>
              <Field data-invalid={Boolean(errors.specialty)}>
                <FieldLabel htmlFor="appointment-specialty">Especialidade</FieldLabel>
                <Input
                  id="appointment-specialty"
                  placeholder="Opcional"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.specialty)}
                  {...register("specialty")}
                />
                {errors.specialty && <FieldError errors={[errors.specialty]} />}
              </Field>
            </div>
            <Field data-invalid={Boolean(errors.professionalName)}>
              <FieldLabel htmlFor="appointment-professional">Profissional</FieldLabel>
              <Input
                id="appointment-professional"
                placeholder="Nome do profissional responsável"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.professionalName)}
                {...register("professionalName")}
              />
              {errors.professionalName && (
                <FieldError errors={[errors.professionalName]} />
              )}
            </Field>
            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="appointment-location">Local</FieldLabel>
              <Input
                id="appointment-location"
                placeholder="Opcional"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.location)}
                {...register("location")}
              />
              {errors.location && <FieldError errors={[errors.location]} />}
            </Field>
            <Field data-invalid={Boolean(errors.reason)}>
              <FieldLabel htmlFor="appointment-reason">Motivo</FieldLabel>
              <Textarea
                id="appointment-reason"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.reason)}
                {...register("reason")}
              />
              {errors.reason && <FieldError errors={[errors.reason]} />}
            </Field>
            <Field data-invalid={Boolean(errors.observations)}>
              <FieldLabel htmlFor="appointment-observations">Observações</FieldLabel>
              <Textarea
                id="appointment-observations"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.observations)}
                {...register("observations")}
              />
              {errors.observations && <FieldError errors={[errors.observations]} />}
            </Field>
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "A guardar..."
                : appointment
                  ? "Guardar alterações"
                  : "Criar consulta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type RescheduleValues = z.input<typeof rescheduleFormSchema>;

export function RescheduleAppointmentDialog({
  appointment,
  residentId,
}: {
  appointment: Pick<AppointmentEditable, "id" | "scheduledAt">;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<RescheduleValues>({
    resolver: zodResolver(rescheduleFormSchema),
    defaultValues: {
      ...schedulingFields(appointment.scheduledAt),
      appointmentId: appointment.id,
      changeReason: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    const { appointmentDate, appointmentTime, ...rescheduleValues } = values;
    addValues(formData, rescheduleValues as Record<string, unknown>);
    formData.set("scheduledAt", scheduledAt(appointmentDate, appointmentTime));
    const result = await rescheduleAppointment(residentId, initialState, formData);
    if (!result.success) {
      Object.entries(result.errors ?? {}).forEach(([key, messages]) => {
        setError(key as keyof RescheduleValues, { message: messages[0] });
      });
      setError("root", { message: result.message });
      return;
    }
    setOpen(false);
    reset({
      ...schedulingFields(appointment.scheduledAt),
      appointmentId: appointment.id,
      changeReason: "",
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <Clock3 aria-hidden="true" data-icon="inline-start" /> Reagendar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar consulta</DialogTitle>
        </DialogHeader>
        <p className="mb-5 text-sm leading-5 text-muted-foreground">
          A data anterior ficará preservada no histórico de alterações.
        </p>
        <form className="flex flex-col gap-5" noValidate onSubmit={submit}>
          <RootError message={errors.root?.message} />
          <input type="hidden" {...register("appointmentId")} />
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.appointmentDate)}>
                <FieldLabel htmlFor={`reschedule-date-${appointment.id}`}>
                  Data da consulta
                </FieldLabel>
                <Input
                  id={`reschedule-date-${appointment.id}`}
                  type="date"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.appointmentDate)}
                  {...register("appointmentDate")}
                />
                {errors.appointmentDate && (
                  <FieldError errors={[errors.appointmentDate]} />
                )}
              </Field>
              <Field data-invalid={Boolean(errors.appointmentTime)}>
                <FieldLabel htmlFor={`reschedule-time-${appointment.id}`}>
                  Hora da consulta
                </FieldLabel>
                <Input
                  id={`reschedule-time-${appointment.id}`}
                  type="time"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.appointmentTime)}
                  {...register("appointmentTime")}
                />
                {errors.appointmentTime && (
                  <FieldError errors={[errors.appointmentTime]} />
                )}
              </Field>
            </div>
            <Field data-invalid={Boolean(errors.changeReason)}>
              <FieldLabel htmlFor={`reschedule-reason-${appointment.id}`}>
                Nota do reagendamento
              </FieldLabel>
              <Textarea
                id={`reschedule-reason-${appointment.id}`}
                placeholder="Opcional"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.changeReason)}
                {...register("changeReason")}
              />
              {errors.changeReason && <FieldError errors={[errors.changeReason]} />}
            </Field>
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "A reagendar..." : "Confirmar reagendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { AppointmentEditable };
