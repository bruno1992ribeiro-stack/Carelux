"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MedicationScheduleMode } from "@prisma/client";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Textarea,
} from "@/components/carelux-ui";
import type { getResidentMedications } from "@/modules/resident-medications/server/get-resident-medications";

import { changeMedicationSchedule } from "../actions";
import {
  medicationScheduleChangeSchema,
  medicationScheduleSchema,
  type MedicationScheduleChangeInput,
  type MedicationScheduleInput,
} from "../schemas/resident-medication.schema";
import { MedicationScheduleFields } from "./create-medication-dialog";

type MedicationData = Awaited<ReturnType<typeof getResidentMedications>>;
type Medication = MedicationData["medications"][number];
type ScheduleRule = Medication["scheduleRules"][number];
type ScheduleChangeValues = z.input<typeof medicationScheduleChangeSchema>;

const initialState = { success: false, message: "" };
const secondaryActionClass =
  "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";

function formatTimeOfDay(value: Date) {
  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function persistedScheduleInput(rule: ScheduleRule): MedicationScheduleInput | null {
  let candidate: unknown;

  switch (rule.mode) {
    case MedicationScheduleMode.DAILY_FREQUENCY:
      if (rule.timesPerDay === null) return null;
      candidate = {
        mode: rule.mode,
        timesPerDay: rule.timesPerDay,
        weekdays: rule.weekdays,
        instructions: rule.instructions,
      };
      break;
    case MedicationScheduleMode.FIXED_TIMES:
      if (
        !rule.occurrences.length ||
        rule.occurrences.some((occurrence) => !occurrence.timeOfDay)
      ) {
        return null;
      }
      candidate = {
        mode: rule.mode,
        weekdays: rule.weekdays,
        instructions: rule.instructions,
        occurrences: rule.occurrences.map((occurrence) => ({
          timeOfDay: occurrence.timeOfDay
            ? formatTimeOfDay(occurrence.timeOfDay)
            : null,
          doseOverride: occurrence.doseOverride,
        })),
      };
      break;
    case MedicationScheduleMode.CARE_MOMENTS:
      if (
        !rule.occurrences.length ||
        rule.occurrences.some((occurrence) => !occurrence.careMoment)
      ) {
        return null;
      }
      candidate = {
        mode: rule.mode,
        weekdays: rule.weekdays,
        instructions: rule.instructions,
        occurrences: rule.occurrences.map((occurrence) => ({
          careMoment: occurrence.careMoment,
          doseOverride: occurrence.doseOverride,
        })),
      };
      break;
    case MedicationScheduleMode.INTERVAL:
      if (rule.intervalHours === null) return null;
      candidate = {
        mode: rule.mode,
        intervalHours: rule.intervalHours,
        weekdays: rule.weekdays,
        instructions: rule.instructions,
      };
      break;
    case MedicationScheduleMode.PRN:
      if (!rule.prnReason?.trim()) return null;
      candidate = {
        mode: rule.mode,
        prnReason: rule.prnReason,
        maxDosesPerDay: rule.maxDosesPerDay,
        minimumIntervalHours: rule.minimumIntervalHours,
        weekdays: rule.weekdays,
        instructions: rule.instructions,
      };
      break;
  }

  const parsed = medicationScheduleSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function scheduleErrorMessage(
  error: FieldErrors<ScheduleChangeValues>["schedule"],
) {
  if (!error) return undefined;
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Verifique os campos do esquema posológico.";
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

function UnavailableScheduleAction({ reason }: { reason: string }) {
  return (
    <Button
      className={secondaryActionClass}
      disabled
      title={reason}
      aria-label={`Alterar esquema indisponível: ${reason}`}
    >
      <RefreshCw aria-hidden="true" data-icon="inline-start" />
      Alterar esquema
    </Button>
  );
}

export function ChangeMedicationScheduleDialog({
  medication,
  residentId,
}: {
  medication: Medication;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);

  if (medication.scheduleRules.length === 0) {
    return (
      <UnavailableScheduleAction reason="Esquema posológico não disponível." />
    );
  }

  if (medication.scheduleRules.length > 1) {
    return (
      <UnavailableScheduleAction reason="Esquema posológico inconsistente." />
    );
  }

  const schedule = persistedScheduleInput(medication.scheduleRules[0]);

  if (!schedule) {
    return (
      <UnavailableScheduleAction reason="Esquema posológico incompleto." />
    );
  }

  return (
    <ScheduleDialog
      key={`${medication.id}-${medication.updatedAt.toISOString()}`}
      medicationId={medication.id}
      residentId={residentId}
      schedule={schedule}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

function ScheduleDialog({
  medicationId,
  onOpenChange,
  open,
  residentId,
  schedule,
}: {
  medicationId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  residentId: string;
  schedule: MedicationScheduleInput;
}) {
  const defaults: ScheduleChangeValues = {
    medicationId,
    schedule,
    reason: "",
  };
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ScheduleChangeValues, unknown, MedicationScheduleChangeInput>({
    resolver: zodResolver(medicationScheduleChangeSchema),
    defaultValues: defaults,
  });

  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("medicationId", values.medicationId);
    formData.set("schedule", JSON.stringify(values.schedule));
    formData.set("reason", values.reason);
    const result = await changeMedicationSchedule(
      residentId,
      initialState,
      formData,
    );

    if (!result.success) {
      Object.entries(result.errors ?? {}).forEach(([key, messages]) => {
        setError(key as keyof ScheduleChangeValues, { message: messages[0] });
      });
      setError("root", { message: result.message });
      return;
    }

    onOpenChange(false);
    reset(defaults);
  });

  const scheduleError = scheduleErrorMessage(errors.schedule);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <RefreshCw aria-hidden="true" data-icon="inline-start" />
        Alterar esquema
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl"
        aria-describedby={`schedule-change-description-${medicationId}`}
      >
        <DialogHeader>
          <DialogTitle>Alterar esquema posológico</DialogTitle>
          <p
            id={`schedule-change-description-${medicationId}`}
            className="text-sm text-muted-foreground"
          >
            O esquema anterior ficará preservado no histórico da medicação.
          </p>
        </DialogHeader>
        <form className="flex flex-col gap-6" noValidate onSubmit={submit}>
          <RootError message={errors.root?.message} />
          <Controller
            name="schedule"
            control={control}
            render={({ field }) => (
              <MedicationScheduleFields
                value={field.value as MedicationScheduleInput}
                onChange={field.onChange}
                disabled={isSubmitting}
                error={scheduleError}
              />
            )}
          />
          <Field data-invalid={Boolean(errors.reason)}>
            <FieldLabel htmlFor={`schedule-change-reason-${medicationId}`}>
              Motivo da alteração
            </FieldLabel>
            <Textarea
              id={`schedule-change-reason-${medicationId}`}
              required
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.reason)}
              {...register("reason")}
            />
            <FieldDescription>
              Este motivo ficará registado no histórico clínico da medicação.
            </FieldDescription>
            {errors.reason && <FieldError errors={[errors.reason]} />}
          </Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "A guardar..." : "Guardar novo esquema"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
