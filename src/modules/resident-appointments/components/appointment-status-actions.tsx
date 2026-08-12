"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentStatus } from "@prisma/client";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import type { z } from "zod";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Textarea,
} from "@/components/carelux-ui";

import {
  cancelAppointment,
  completeAppointment,
  correctAppointmentStatus,
  reopenAppointment,
} from "../actions";
import {
  appointmentCancelSchema,
  appointmentReopenSchema,
  appointmentStatusCorrectionSchema,
} from "../schemas/resident-appointment.schema";

const initialState = { success: false, message: "" };
const secondaryActionClass =
  "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";
const destructiveActionClass =
  "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90";

function ActionError({ message }: { message?: string }) {
  return message ? (
    <p
      role="alert"
      className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </p>
  ) : null;
}

export function CompleteAppointmentDialog({
  appointmentId,
  residentId,
}: {
  appointmentId: string;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <CheckCircle2 aria-hidden="true" data-icon="inline-start" /> Marcar como realizada
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar consulta como realizada</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-5 text-muted-foreground">
          A conclusão é explícita e ficará registada no histórico da consulta.
        </p>
        <ActionError message={message} />
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <DialogClose render={<Button className={secondaryActionClass} />}>
            Voltar
          </DialogClose>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await completeAppointment(
                  residentId,
                  appointmentId,
                  initialState,
                );
                if (result.success) setOpen(false);
                else setMessage(result.message);
              })
            }
          >
            {pending ? "A concluir..." : "Confirmar realização"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type CancelValues = z.input<typeof appointmentCancelSchema>;

export function CancelAppointmentDialog({
  appointmentId,
  residentId,
}: {
  appointmentId: string;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CancelValues>({
    resolver: zodResolver(appointmentCancelSchema),
    defaultValues: { appointmentId, cancellationReason: "" },
  });
  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("appointmentId", values.appointmentId);
    formData.set("cancellationReason", values.cancellationReason);
    const result = await cancelAppointment(residentId, initialState, formData);
    if (!result.success) {
      setError("root", { message: result.message });
      return;
    }
    setOpen(false);
    reset({ appointmentId, cancellationReason: "" });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <XCircle aria-hidden="true" data-icon="inline-start" /> Cancelar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar consulta</DialogTitle>
        </DialogHeader>
        <p className="mb-5 text-sm leading-5 text-muted-foreground">
          A consulta permanecerá no histórico. Indique por que motivo foi cancelada.
        </p>
        <form className="flex flex-col gap-5" noValidate onSubmit={submit}>
          <ActionError message={errors.root?.message} />
          <input type="hidden" {...register("appointmentId")} />
          <Field data-invalid={Boolean(errors.cancellationReason)}>
            <FieldLabel htmlFor={`cancel-reason-${appointmentId}`}>
              Motivo do cancelamento
            </FieldLabel>
            <Textarea
              id={`cancel-reason-${appointmentId}`}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.cancellationReason)}
              {...register("cancellationReason")}
            />
            {errors.cancellationReason && (
              <FieldError errors={[errors.cancellationReason]} />
            )}
          </Field>
          <div className="flex justify-end">
            <Button
              type="submit"
              className={destructiveActionClass}
              disabled={isSubmitting}
            >
              {isSubmitting ? "A cancelar..." : "Cancelar consulta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type ReopenValues = z.input<typeof appointmentReopenSchema>;

export function ReopenAppointmentDialog({
  appointmentId,
  residentId,
}: {
  appointmentId: string;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ReopenValues>({
    resolver: zodResolver(appointmentReopenSchema),
    defaultValues: { appointmentId, changeReason: "" },
  });
  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("appointmentId", values.appointmentId);
    formData.set("changeReason", values.changeReason);
    const result = await reopenAppointment(residentId, initialState, formData);
    if (!result.success) {
      setError("root", { message: result.message });
      return;
    }
    setOpen(false);
    reset({ appointmentId, changeReason: "" });
  });

  return (
    <ReasonDialog
      description="A consulta volta a ficar agendada. A correção e o estado anterior permanecem no histórico."
      error={errors.changeReason}
      isSubmitting={isSubmitting}
      label="Motivo da reabertura"
      onOpenChange={setOpen}
      open={open}
      register={register("changeReason")}
      rootError={errors.root?.message}
      submit={submit}
      submitLabel="Reabrir consulta"
      title="Reabrir consulta"
    />
  );
}

type CorrectionValues = z.input<typeof appointmentStatusCorrectionSchema>;

export function CorrectAppointmentStatusDialog({
  appointmentId,
  currentStatus,
  residentId,
}: {
  appointmentId: string;
  currentStatus: Exclude<AppointmentStatus, "SCHEDULED">;
  residentId: string;
}) {
  const targetStatus =
    currentStatus === AppointmentStatus.COMPLETED
      ? AppointmentStatus.CANCELLED
      : AppointmentStatus.COMPLETED;
  const [open, setOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CorrectionValues>({
    resolver: zodResolver(appointmentStatusCorrectionSchema),
    defaultValues: {
      appointmentId,
      cancellationReason: "",
      changeReason: "",
      targetStatus,
    },
  });
  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("appointmentId", String(values.appointmentId));
    formData.set("targetStatus", String(values.targetStatus));
    formData.set("changeReason", String(values.changeReason));
    formData.set("cancellationReason", String(values.cancellationReason ?? ""));
    const result = await correctAppointmentStatus(residentId, initialState, formData);
    if (!result.success) {
      Object.entries(result.errors ?? {}).forEach(([key, messages]) => {
        setError(key as keyof CorrectionValues, { message: messages[0] });
      });
      setError("root", { message: result.message });
      return;
    }
    setOpen(false);
    reset({ appointmentId, cancellationReason: "", changeReason: "", targetStatus });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <RotateCcw aria-hidden="true" data-icon="inline-start" /> Corrigir estado
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Corrigir estado da consulta</DialogTitle>
        </DialogHeader>
        <p className="mb-5 text-sm leading-5 text-muted-foreground">
          Esta correção altera o estado para {targetStatus === AppointmentStatus.COMPLETED
            ? "Realizada"
            : "Cancelada"} e fica registada no histórico.
        </p>
        <form className="flex flex-col gap-5" noValidate onSubmit={submit}>
          <ActionError message={errors.root?.message} />
          <input type="hidden" {...register("appointmentId")} />
          <input type="hidden" {...register("targetStatus")} />
          <FieldGroup>
            <Field data-invalid={Boolean(errors.changeReason)}>
              <FieldLabel htmlFor={`correction-reason-${appointmentId}`}>
                Motivo da correção
              </FieldLabel>
              <Textarea
                id={`correction-reason-${appointmentId}`}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.changeReason)}
                {...register("changeReason")}
              />
              {errors.changeReason && <FieldError errors={[errors.changeReason]} />}
            </Field>
            {targetStatus === AppointmentStatus.CANCELLED && (
              <Field data-invalid={Boolean(errors.cancellationReason)}>
                <FieldLabel htmlFor={`correction-cancel-${appointmentId}`}>
                  Motivo do cancelamento
                </FieldLabel>
                <Textarea
                  id={`correction-cancel-${appointmentId}`}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.cancellationReason)}
                  {...register("cancellationReason")}
                />
                {errors.cancellationReason && (
                  <FieldError errors={[errors.cancellationReason]} />
                )}
              </Field>
            )}
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "A corrigir..." : "Guardar correção"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReasonDialog({
  description,
  error,
  isSubmitting,
  label,
  onOpenChange,
  open,
  register,
  rootError,
  submit,
  submitLabel,
  title,
}: {
  description: string;
  error?: { message?: string };
  isSubmitting: boolean;
  label: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  register: UseFormRegisterReturn;
  rootError?: string;
  submit: () => void;
  submitLabel: string;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <RotateCcw aria-hidden="true" data-icon="inline-start" /> Reabrir
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="mb-5 text-sm leading-5 text-muted-foreground">{description}</p>
        <form className="flex flex-col gap-5" noValidate onSubmit={submit}>
          <ActionError message={rootError} />
          <Field data-invalid={Boolean(error)}>
            <FieldLabel>{label}</FieldLabel>
            <Textarea
              disabled={isSubmitting}
              aria-invalid={Boolean(error)}
              {...register}
            />
            {error && <FieldError errors={[error]} />}
          </Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "A guardar..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
