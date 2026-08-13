"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Textarea,
} from "@/components/carelux-ui";
import type { getResidentMedications } from "@/modules/resident-medications/server/get-resident-medications";

import { editMedication } from "../actions";
import {
  medicationEditSchema,
  type MedicationEditInput,
} from "../schemas/resident-medication.schema";

type MedicationData = Awaited<ReturnType<typeof getResidentMedications>>;
type Medication = MedicationData["medications"][number];
type MedicationEditValues = z.input<typeof medicationEditSchema>;

const initialState = { success: false, message: "" };
const secondaryActionClass =
  "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";

function dateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function formDefaults(medication: Medication): MedicationEditValues {
  return {
    prescriberUserId: medication.prescriberUserId,
    prescriberName: medication.prescriberName,
    medicationName: medication.medicationName,
    dosage: medication.dosage,
    pharmaceuticalForm: medication.pharmaceuticalForm,
    administrationRoute: medication.administrationRoute,
    indication: medication.indication ?? "",
    observations: medication.observations ?? "",
    startDate: dateInputValue(medication.startDate),
    endDate: dateInputValue(medication.endDate),
  };
}

function toDateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function editFormData(
  values: MedicationEditInput,
  existingPrescriberUserId: string | null,
) {
  const formData = new FormData();
  formData.set("prescriberUserId", existingPrescriberUserId ?? "");
  formData.set("prescriberName", values.prescriberName);
  formData.set("medicationName", values.medicationName);
  formData.set("dosage", values.dosage);
  formData.set("pharmaceuticalForm", values.pharmaceuticalForm);
  formData.set("administrationRoute", values.administrationRoute);
  formData.set("indication", values.indication ?? "");
  formData.set("observations", values.observations ?? "");
  formData.set("startDate", toDateValue(values.startDate));
  formData.set("endDate", toDateValue(values.endDate));
  return formData;
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

export function EditMedicationDialog({
  medication,
  residentId,
}: {
  medication: Medication;
  residentId: string;
}) {
  const [open, setOpen] = useState(false);
  const defaults = formDefaults(medication);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<MedicationEditValues, unknown, MedicationEditInput>({
    resolver: zodResolver(medicationEditSchema),
    defaultValues: defaults,
  });

  const submit = handleSubmit(async (values) => {
    const result = await editMedication(
      residentId,
      medication.id,
      initialState,
      editFormData(values, medication.prescriberUserId),
    );

    if (!result.success) {
      Object.entries(result.errors ?? {}).forEach(([key, messages]) => {
        setError(key as keyof MedicationEditValues, { message: messages[0] });
      });
      setError("root", { message: result.message });
      return;
    }

    setOpen(false);
    reset(defaults);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className={secondaryActionClass} />}>
        <PencilLine aria-hidden="true" data-icon="inline-start" />
        Editar
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl"
        aria-describedby={`edit-medication-description-${medication.id}`}
      >
        <DialogHeader>
          <DialogTitle>Editar medicação</DialogTitle>
          <p
            id={`edit-medication-description-${medication.id}`}
            className="text-sm text-muted-foreground"
          >
            Atualize os dados da prescrição. O esquema posológico é alterado
            numa ação separada.
          </p>
        </DialogHeader>
        <form className="flex flex-col gap-6" noValidate onSubmit={submit}>
          <RootError message={errors.root?.message} />
          <FieldSet>
            <FieldLegend>Prescrição</FieldLegend>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.medicationName)}>
                  <FieldLabel htmlFor={`medication-name-${medication.id}`}>
                    Nome do medicamento
                  </FieldLabel>
                  <Input
                    id={`medication-name-${medication.id}`}
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.medicationName)}
                    {...register("medicationName")}
                  />
                  {errors.medicationName && (
                    <FieldError errors={[errors.medicationName]} />
                  )}
                </Field>
                <Field data-invalid={Boolean(errors.dosage)}>
                  <FieldLabel htmlFor={`medication-dosage-${medication.id}`}>
                    Dosagem
                  </FieldLabel>
                  <Input
                    id={`medication-dosage-${medication.id}`}
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.dosage)}
                    {...register("dosage")}
                  />
                  {errors.dosage && <FieldError errors={[errors.dosage]} />}
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.pharmaceuticalForm)}>
                  <FieldLabel htmlFor={`medication-form-${medication.id}`}>
                    Forma farmacêutica
                  </FieldLabel>
                  <Input
                    id={`medication-form-${medication.id}`}
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.pharmaceuticalForm)}
                    {...register("pharmaceuticalForm")}
                  />
                  {errors.pharmaceuticalForm && (
                    <FieldError errors={[errors.pharmaceuticalForm]} />
                  )}
                </Field>
                <Field data-invalid={Boolean(errors.administrationRoute)}>
                  <FieldLabel htmlFor={`medication-route-${medication.id}`}>
                    Via de administração
                  </FieldLabel>
                  <Input
                    id={`medication-route-${medication.id}`}
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.administrationRoute)}
                    {...register("administrationRoute")}
                  />
                  {errors.administrationRoute && (
                    <FieldError errors={[errors.administrationRoute]} />
                  )}
                </Field>
              </div>

              <Field data-invalid={Boolean(errors.prescriberName)}>
                <FieldLabel htmlFor={`medication-prescriber-${medication.id}`}>
                  Prescritor
                </FieldLabel>
                <Input
                  id={`medication-prescriber-${medication.id}`}
                  required
                  readOnly={Boolean(medication.prescriberUserId)}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.prescriberName)}
                  {...register("prescriberName")}
                />
                <FieldDescription>
                  {medication.prescriberUserId
                    ? "Associação interna preservada. Para mudar o profissional será necessário um seletor interno seguro."
                    : "Prescritor registado por nome."}
                </FieldDescription>
                {errors.prescriberName && (
                  <FieldError errors={[errors.prescriberName]} />
                )}
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.startDate)}>
                  <FieldLabel htmlFor={`medication-start-${medication.id}`}>
                    Data de início
                  </FieldLabel>
                  <Input
                    id={`medication-start-${medication.id}`}
                    type="date"
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.startDate)}
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <FieldError errors={[errors.startDate]} />
                  )}
                </Field>
                <Field data-invalid={Boolean(errors.endDate)}>
                  <FieldLabel htmlFor={`medication-end-${medication.id}`}>
                    Data de fim
                  </FieldLabel>
                  <Input
                    id={`medication-end-${medication.id}`}
                    type="date"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.endDate)}
                    {...register("endDate")}
                  />
                  {errors.endDate && <FieldError errors={[errors.endDate]} />}
                </Field>
              </div>

              <Field data-invalid={Boolean(errors.indication)}>
                <FieldLabel htmlFor={`medication-indication-${medication.id}`}>
                  Indicação
                </FieldLabel>
                <Textarea
                  id={`medication-indication-${medication.id}`}
                  placeholder="Opcional"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.indication)}
                  {...register("indication")}
                />
                {errors.indication && (
                  <FieldError errors={[errors.indication]} />
                )}
              </Field>
              <Field data-invalid={Boolean(errors.observations)}>
                <FieldLabel
                  htmlFor={`medication-observations-${medication.id}`}
                >
                  Observações
                </FieldLabel>
                <Textarea
                  id={`medication-observations-${medication.id}`}
                  placeholder="Opcional"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.observations)}
                  {...register("observations")}
                />
                {errors.observations && (
                  <FieldError errors={[errors.observations]} />
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "A guardar..." : "Guardar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
