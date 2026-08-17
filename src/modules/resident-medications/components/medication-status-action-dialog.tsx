"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MedicationStatus } from "@prisma/client";
import {
  Archive,
  PauseCircle,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import {
  type Resolver,
  useForm,
} from "react-hook-form";

import {
  Button,
  Dialog,
  DialogClose,
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

import {
  discontinueMedication,
  reactivateMedication,
  suspendMedication,
  type MedicationActionState,
} from "../actions";
import {
  medicationDiscontinueSchema,
  medicationReactivateSchema,
  medicationSuspendSchema,
  type MedicationSuspendInput,
} from "../schemas/resident-medication.schema";

type MedicationStatusAction = "suspend" | "reactivate" | "discontinue";
type MedicationStatusValues = MedicationSuspendInput;
type MedicationStatusServerAction = (
  residentId: string,
  state: MedicationActionState,
  formData: FormData,
) => Promise<MedicationActionState>;

type StatusActionConfig = {
  action: MedicationStatusServerAction;
  description: string;
  Icon: LucideIcon;
  pendingLabel: string;
  resolver: Resolver<MedicationStatusValues>;
  submitLabel: string;
  title: string;
  triggerLabel: string;
  terminal: boolean;
};

const initialState: MedicationActionState = { success: false, message: "" };
const secondaryActionClass =
  "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";
const terminalActionClass =
  "border border-destructive/30 bg-transparent px-3 py-2 text-destructive shadow-none hover:bg-destructive/10";
const destructiveSubmitClass =
  "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90";

const actionConfigs: Record<MedicationStatusAction, StatusActionConfig> = {
  suspend: {
    action: suspendMedication,
    description:
      "A medicação ficará temporariamente suspensa e poderá ser reativada posteriormente.",
    Icon: PauseCircle,
    pendingLabel: "A suspender...",
    resolver: zodResolver(medicationSuspendSchema),
    submitLabel: "Suspender medicação",
    title: "Suspender medicação",
    triggerLabel: "Suspender",
    terminal: false,
  },
  reactivate: {
    action: reactivateMedication,
    description:
      "A medicação regressará ao estado ativo sem alterar a prescrição ou o esquema posológico.",
    Icon: PlayCircle,
    pendingLabel: "A reativar...",
    resolver: zodResolver(medicationReactivateSchema),
    submitLabel: "Reativar medicação",
    title: "Reativar medicação",
    triggerLabel: "Reativar",
    terminal: false,
  },
  discontinue: {
    action: discontinueMedication,
    description:
      "A medicação será descontinuada e permanecerá preservada no histórico. Esta é uma operação terminal, sem reativação normal.",
    Icon: Archive,
    pendingLabel: "A descontinuar...",
    resolver: zodResolver(medicationDiscontinueSchema),
    submitLabel: "Descontinuar medicação",
    title: "Descontinuar medicação",
    triggerLabel: "Descontinuar",
    terminal: true,
  },
};

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

function MedicationStatusActionDialog({
  actionType,
  medicationId,
  residentId,
}: {
  actionType: MedicationStatusAction;
  medicationId: string;
  residentId: string;
}) {
  const config = actionConfigs[actionType];
  const [open, setOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<MedicationStatusValues>({
    resolver: config.resolver,
    defaultValues: { medicationId, reason: "" },
  });

  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("medicationId", values.medicationId);
    formData.set("reason", values.reason);

    const result = await config.action(residentId, initialState, formData);

    if (!result.success) {
      Object.entries(result.errors ?? {}).forEach(([key, messages]) => {
        setError(key as keyof MedicationStatusValues, { message: messages[0] });
      });
      setError("root", { message: result.message });
      return;
    }

    setOpen(false);
    reset({ medicationId, reason: "" });
  });

  const { Icon } = config;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className={
              config.terminal ? terminalActionClass : secondaryActionClass
            }
          />
        }
      >
        <Icon aria-hidden="true" data-icon="inline-start" />
        {config.triggerLabel}
      </DialogTrigger>
      <DialogContent
        aria-describedby={`${actionType}-medication-description-${medicationId}`}
      >
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <p
            id={`${actionType}-medication-description-${medicationId}`}
            className="text-sm leading-5 text-muted-foreground"
          >
            {config.description}
          </p>
        </DialogHeader>
        <form className="flex flex-col gap-5" noValidate onSubmit={submit}>
          <ActionError message={errors.root?.message} />
          <input type="hidden" {...register("medicationId")} />
          <Field data-invalid={Boolean(errors.reason)}>
            <FieldLabel htmlFor={`${actionType}-medication-reason-${medicationId}`}>
              Motivo
            </FieldLabel>
            <Textarea
              id={`${actionType}-medication-reason-${medicationId}`}
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose
              render={
                <Button
                  type="button"
                  className={secondaryActionClass}
                  disabled={isSubmitting}
                />
              }
            >
              Voltar
            </DialogClose>
            <Button
              type="submit"
              className={config.terminal ? destructiveSubmitClass : undefined}
              disabled={isSubmitting}
            >
              {isSubmitting ? config.pendingLabel : config.submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MedicationStatusActions({
  medicationId,
  residentId,
  status,
}: {
  medicationId: string;
  residentId: string;
  status: MedicationStatus;
}) {
  if (status === MedicationStatus.DISCONTINUED) {
    return null;
  }

  return (
    <>
      <MedicationStatusActionDialog
        actionType={
          status === MedicationStatus.ACTIVE ? "suspend" : "reactivate"
        }
        medicationId={medicationId}
        residentId={residentId}
      />
      <MedicationStatusActionDialog
        actionType="discontinue"
        medicationId={medicationId}
        residentId={residentId}
      />
    </>
  );
}
