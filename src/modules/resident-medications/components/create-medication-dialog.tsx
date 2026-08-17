"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicationCareMoment,
  MedicationScheduleMode,
  MedicationWeekday,
} from "@prisma/client";
import { Minus, Pill, Plus } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  type FieldErrors,
  useForm,
} from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/carelux-ui";

import { createMedication } from "../actions";
import {
  medicationCreateSchema,
  type MedicationCreateInput,
  type MedicationScheduleInput,
} from "../schemas/resident-medication.schema";

const initialState = { success: false, message: "" };
const secondaryActionClass =
  "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";

const scheduleModeLabels: Record<MedicationScheduleMode, string> = {
  DAILY_FREQUENCY: "Número de tomas por dia",
  FIXED_TIMES: "Horários específicos",
  CARE_MOMENTS: "Momentos assistenciais",
  INTERVAL: "Intervalo regular",
  PRN: "SOS / quando necessário",
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

const careMomentLabels: Record<MedicationCareMoment, string> = {
  BREAKFAST: "Pequeno-almoço",
  LUNCH: "Almoço",
  DINNER: "Jantar",
  BEDTIME: "Ao deitar",
};

type MedicationFormValues = z.input<typeof medicationCreateSchema>;

export const defaultMedicationSchedule = (
  mode: MedicationScheduleMode,
): MedicationScheduleInput => {
  switch (mode) {
    case MedicationScheduleMode.DAILY_FREQUENCY:
      return {
        mode,
        timesPerDay: 1,
        weekdays: [],
        instructions: null,
      };
    case MedicationScheduleMode.FIXED_TIMES:
      return {
        mode,
        weekdays: [],
        instructions: null,
        occurrences: [{ timeOfDay: "", doseOverride: null }],
      };
    case MedicationScheduleMode.CARE_MOMENTS:
      return {
        mode,
        weekdays: [],
        instructions: null,
        occurrences: [],
      };
    case MedicationScheduleMode.INTERVAL:
      return {
        mode,
        intervalHours: 1,
        weekdays: [],
        instructions: null,
      };
    case MedicationScheduleMode.PRN:
      return {
        mode,
        prnReason: "",
        maxDosesPerDay: null,
        minimumIntervalHours: null,
        weekdays: [],
        instructions: null,
      };
  }
};

function scheduleForMode(
  mode: MedicationScheduleMode,
  previousSchedule: MedicationScheduleInput,
): MedicationScheduleInput {
  return {
    ...defaultMedicationSchedule(mode),
    weekdays: [...previousSchedule.weekdays],
    instructions: previousSchedule.instructions,
  };
}

const defaultValues: MedicationFormValues = {
  prescriberUserId: null,
  prescriberName: "",
  medicationName: "",
  dosage: "",
  pharmaceuticalForm: "",
  administrationRoute: "",
  indication: null,
  observations: null,
  startDate: "",
  endDate: null,
  schedule: defaultMedicationSchedule(
    MedicationScheduleMode.DAILY_FREQUENCY,
  ),
};

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

function scheduleErrorMessage(
  error: FieldErrors<MedicationFormValues>["schedule"],
) {
  if (!error) return undefined;
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Verifique os campos do esquema posológico.";
}

function optionalNumber(value: string) {
  return value === "" ? null : Number(value);
}

function toggleWeekday(
  weekdays: MedicationWeekday[],
  weekday: MedicationWeekday,
) {
  if (weekdays.includes(weekday)) {
    return weekdays.filter((item) => item !== weekday);
  }

  return Object.values(MedicationWeekday).filter(
    (item) => item === weekday || weekdays.includes(item),
  );
}

function WeekdayFields({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean;
  onChange: (value: MedicationWeekday[]) => void;
  value: MedicationWeekday[];
}) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Dias da semana</FieldLegend>
      <FieldDescription>
        Sem dias selecionados, o esquema aplica-se todos os dias.
      </FieldDescription>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {Object.values(MedicationWeekday).map((weekday) => (
          <label
            key={weekday}
            className="interactive-target flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-input px-2 py-2 text-sm font-medium text-foreground has-checked:border-primary has-checked:bg-primary/10"
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={value.includes(weekday)}
              disabled={disabled}
              onChange={() => onChange(toggleWeekday(value, weekday))}
            />
            {weekdayLabels[weekday]}
          </label>
        ))}
      </div>
    </FieldSet>
  );
}

function FixedTimesFields({
  disabled,
  onChange,
  schedule,
}: {
  disabled: boolean;
  onChange: (value: MedicationScheduleInput) => void;
  schedule: Extract<
    MedicationScheduleInput,
    { mode: typeof MedicationScheduleMode.FIXED_TIMES }
  >;
}) {
  const updateOccurrence = (
    index: number,
    patch: Partial<(typeof schedule.occurrences)[number]>,
  ) => {
    onChange({
      ...schedule,
      occurrences: schedule.occurrences.map((occurrence, occurrenceIndex) =>
        occurrenceIndex === index ? { ...occurrence, ...patch } : occurrence,
      ),
    });
  };

  return (
    <FieldSet>
      <div className="flex items-center justify-between gap-3">
        <FieldLegend variant="label">Horários</FieldLegend>
        <Button
          type="button"
          className={secondaryActionClass}
          disabled={disabled}
          onClick={() =>
            onChange({
              ...schedule,
              occurrences: [
                ...schedule.occurrences,
                { timeOfDay: "", doseOverride: null },
              ],
            })
          }
        >
          <Plus aria-hidden="true" data-icon="inline-start" />
          Adicionar horário
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {schedule.occurrences.map((occurrence, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto] sm:items-end"
          >
            <Field>
              <FieldLabel htmlFor={`medication-time-${index}`}>
                Hora
              </FieldLabel>
              <Input
                id={`medication-time-${index}`}
                type="time"
                required
                disabled={disabled}
                value={occurrence.timeOfDay}
                onChange={(event) =>
                  updateOccurrence(index, { timeOfDay: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`medication-time-dose-${index}`}>
                Dose específica
              </FieldLabel>
              <Input
                id={`medication-time-dose-${index}`}
                placeholder="Opcional"
                disabled={disabled}
                value={occurrence.doseOverride ?? ""}
                onChange={(event) =>
                  updateOccurrence(index, {
                    doseOverride: event.target.value || null,
                  })
                }
              />
            </Field>
            <Button
              type="button"
              className={secondaryActionClass}
              aria-label={`Remover horário ${index + 1}`}
              disabled={disabled || schedule.occurrences.length === 1}
              onClick={() =>
                onChange({
                  ...schedule,
                  occurrences: schedule.occurrences.filter(
                    (_, occurrenceIndex) => occurrenceIndex !== index,
                  ),
                })
              }
            >
              <Minus aria-hidden="true" />
              Remover
            </Button>
          </div>
        ))}
      </div>
    </FieldSet>
  );
}

function CareMomentsFields({
  disabled,
  onChange,
  schedule,
}: {
  disabled: boolean;
  onChange: (value: MedicationScheduleInput) => void;
  schedule: Extract<
    MedicationScheduleInput,
    { mode: typeof MedicationScheduleMode.CARE_MOMENTS }
  >;
}) {
  const toggleMoment = (careMoment: MedicationCareMoment) => {
    const selected = schedule.occurrences.some(
      (occurrence) => occurrence.careMoment === careMoment,
    );
    const occurrences = selected
      ? schedule.occurrences.filter(
          (occurrence) => occurrence.careMoment !== careMoment,
        )
      : Object.values(MedicationCareMoment)
          .filter(
            (moment) =>
              moment === careMoment ||
              schedule.occurrences.some(
                (occurrence) => occurrence.careMoment === moment,
              ),
          )
          .map(
            (moment) =>
              schedule.occurrences.find(
                (occurrence) => occurrence.careMoment === moment,
              ) ?? { careMoment: moment, doseOverride: null },
          );

    onChange({ ...schedule, occurrences });
  };

  const updateDose = (
    careMoment: MedicationCareMoment,
    doseOverride: string,
  ) => {
    onChange({
      ...schedule,
      occurrences: schedule.occurrences.map((occurrence) =>
        occurrence.careMoment === careMoment
          ? { ...occurrence, doseOverride: doseOverride || null }
          : occurrence,
      ),
    });
  };

  return (
    <FieldSet>
      <FieldLegend variant="label">Momentos assistenciais</FieldLegend>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.values(MedicationCareMoment).map((careMoment) => {
          const occurrence = schedule.occurrences.find(
            (item) => item.careMoment === careMoment,
          );

          return (
            <div
              key={careMoment}
              className="rounded-xl border border-border bg-input p-3"
            >
              <label className="interactive-target flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={Boolean(occurrence)}
                  disabled={disabled}
                  onChange={() => toggleMoment(careMoment)}
                />
                {careMomentLabels[careMoment]}
              </label>
              {occurrence && (
                <Field className="mt-3">
                  <FieldLabel htmlFor={`medication-moment-${careMoment}`}>
                    Dose específica
                  </FieldLabel>
                  <Input
                    id={`medication-moment-${careMoment}`}
                    placeholder="Opcional"
                    disabled={disabled}
                    value={occurrence.doseOverride ?? ""}
                    onChange={(event) =>
                      updateDose(careMoment, event.target.value)
                    }
                  />
                </Field>
              )}
            </div>
          );
        })}
      </div>
    </FieldSet>
  );
}

export function MedicationScheduleFields({
  disabled,
  error,
  onChange,
  value,
}: {
  disabled: boolean;
  error?: string;
  onChange: (value: MedicationScheduleInput) => void;
  value: MedicationScheduleInput;
}) {
  return (
    <FieldSet className="rounded-2xl border border-border bg-background/60 p-4 sm:p-5">
      <FieldLegend>Esquema posológico</FieldLegend>
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="medication-schedule-mode">
            Modo de toma
          </FieldLabel>
          <Select
            items={Object.values(MedicationScheduleMode).map((mode) => ({
              label: scheduleModeLabels[mode],
              value: mode,
            }))}
            value={value.mode}
            onValueChange={(mode) => {
              if (mode) onChange(scheduleForMode(mode, value));
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id="medication-schedule-mode"
              aria-invalid={Boolean(error)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MedicationScheduleMode).map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {scheduleModeLabels[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <WeekdayFields
          disabled={disabled}
          value={value.weekdays}
          onChange={(weekdays) => onChange({ ...value, weekdays })}
        />

        {value.mode === MedicationScheduleMode.DAILY_FREQUENCY && (
          <Field>
            <FieldLabel htmlFor="medication-times-per-day">
              Número de tomas por dia
            </FieldLabel>
            <Input
              id="medication-times-per-day"
              type="number"
              min={1}
              step={1}
              required
              disabled={disabled}
              value={value.timesPerDay || ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  timesPerDay: Number(event.target.value),
                })
              }
            />
          </Field>
        )}

        {value.mode === MedicationScheduleMode.FIXED_TIMES && (
          <FixedTimesFields
            disabled={disabled}
            schedule={value}
            onChange={onChange}
          />
        )}

        {value.mode === MedicationScheduleMode.CARE_MOMENTS && (
          <CareMomentsFields
            disabled={disabled}
            schedule={value}
            onChange={onChange}
          />
        )}

        {value.mode === MedicationScheduleMode.INTERVAL && (
          <Field>
            <FieldLabel htmlFor="medication-interval-hours">
              Intervalo em horas
            </FieldLabel>
            <Input
              id="medication-interval-hours"
              type="number"
              min={1}
              step={1}
              required
              disabled={disabled}
              value={value.intervalHours || ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  intervalHours: Number(event.target.value),
                })
              }
            />
          </Field>
        )}

        {value.mode === MedicationScheduleMode.PRN && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="medication-prn-reason">
                Motivo da toma SOS
              </FieldLabel>
              <Input
                id="medication-prn-reason"
                required
                disabled={disabled}
                value={value.prnReason}
                onChange={(event) =>
                  onChange({ ...value, prnReason: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="medication-prn-max-doses">
                Máximo de tomas por dia
              </FieldLabel>
              <Input
                id="medication-prn-max-doses"
                type="number"
                min={1}
                step={1}
                placeholder="Opcional"
                disabled={disabled}
                value={value.maxDosesPerDay ?? ""}
                onChange={(event) =>
                  onChange({
                    ...value,
                    maxDosesPerDay: optionalNumber(event.target.value),
                  })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="medication-prn-minimum-interval">
                Intervalo mínimo em horas
              </FieldLabel>
              <Input
                id="medication-prn-minimum-interval"
                type="number"
                min={1}
                step={1}
                placeholder="Opcional"
                disabled={disabled}
                value={value.minimumIntervalHours ?? ""}
                onChange={(event) =>
                  onChange({
                    ...value,
                    minimumIntervalHours: optionalNumber(event.target.value),
                  })
                }
              />
            </Field>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="medication-schedule-instructions">
            Instruções do esquema
          </FieldLabel>
          <Textarea
            id="medication-schedule-instructions"
            placeholder="Opcional"
            disabled={disabled}
            value={value.instructions ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                instructions: event.target.value || null,
              })
            }
          />
        </Field>
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>
    </FieldSet>
  );
}

function toDateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function createFormData(values: MedicationCreateInput) {
  const formData = new FormData();
  formData.set("prescriberUserId", values.prescriberUserId ?? "");
  formData.set("prescriberName", values.prescriberName);
  formData.set("medicationName", values.medicationName);
  formData.set("dosage", values.dosage);
  formData.set("pharmaceuticalForm", values.pharmaceuticalForm);
  formData.set("administrationRoute", values.administrationRoute);
  formData.set("indication", values.indication ?? "");
  formData.set("observations", values.observations ?? "");
  formData.set("startDate", toDateValue(values.startDate));
  formData.set("endDate", toDateValue(values.endDate));
  formData.set("schedule", JSON.stringify(values.schedule));
  return formData;
}

export function CreateMedicationDialog({ residentId }: { residentId: string }) {
  const [open, setOpen] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<MedicationFormValues, unknown, MedicationCreateInput>({
    resolver: zodResolver(medicationCreateSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    const result = await createMedication(
      residentId,
      initialState,
      createFormData(values),
    );

    if (!result.success) {
      Object.entries(result.errors ?? {}).forEach(([key, messages]) => {
        setError(key as keyof MedicationFormValues, { message: messages[0] });
      });
      setError("root", { message: result.message });
      return;
    }

    setOpen(false);
    reset(defaultValues);
  });

  const scheduleError = scheduleErrorMessage(errors.schedule);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus aria-hidden="true" data-icon="inline-start" />
        Adicionar medicação
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl"
        aria-describedby="create-medication-description"
      >
        <DialogHeader>
          <DialogTitle>Adicionar medicação</DialogTitle>
          <p
            id="create-medication-description"
            className="text-sm text-muted-foreground"
          >
            Registe a prescrição e um único esquema posológico para o utente.
          </p>
        </DialogHeader>
        <form className="flex flex-col gap-6" noValidate onSubmit={submit}>
          <RootError message={errors.root?.message} />

          <FieldSet>
            <FieldLegend>Prescrição</FieldLegend>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.medicationName)}>
                  <FieldLabel htmlFor="medication-name">
                    Nome do medicamento
                  </FieldLabel>
                  <Input
                    id="medication-name"
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
                  <FieldLabel htmlFor="medication-dosage">Dosagem</FieldLabel>
                  <Input
                    id="medication-dosage"
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
                  <FieldLabel htmlFor="medication-form">
                    Forma farmacêutica
                  </FieldLabel>
                  <Input
                    id="medication-form"
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
                  <FieldLabel htmlFor="medication-route">
                    Via de administração
                  </FieldLabel>
                  <Input
                    id="medication-route"
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
                <FieldLabel htmlFor="medication-prescriber">
                  Prescritor
                </FieldLabel>
                <Input
                  id="medication-prescriber"
                  required
                  placeholder="Nome do prescritor"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.prescriberName)}
                  {...register("prescriberName")}
                />
                <FieldDescription>
                  Nesta fase, o prescritor é registado pelo nome indicado.
                </FieldDescription>
                {errors.prescriberName && (
                  <FieldError errors={[errors.prescriberName]} />
                )}
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.startDate)}>
                  <FieldLabel htmlFor="medication-start-date">
                    Data de início
                  </FieldLabel>
                  <Input
                    id="medication-start-date"
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
                  <FieldLabel htmlFor="medication-end-date">
                    Data de fim
                  </FieldLabel>
                  <Input
                    id="medication-end-date"
                    type="date"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.endDate)}
                    {...register("endDate")}
                  />
                  {errors.endDate && <FieldError errors={[errors.endDate]} />}
                </Field>
              </div>

              <Field data-invalid={Boolean(errors.indication)}>
                <FieldLabel htmlFor="medication-indication">
                  Indicação
                </FieldLabel>
                <Textarea
                  id="medication-indication"
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
                <FieldLabel htmlFor="medication-observations">
                  Observações
                </FieldLabel>
                <Textarea
                  id="medication-observations"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Pill aria-hidden="true" data-icon="inline-start" />
              {isSubmitting ? "A guardar..." : "Adicionar medicação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
