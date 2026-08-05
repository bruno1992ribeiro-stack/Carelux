"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Gender, ResidentStatus } from "@prisma/client";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Field,
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
} from "@/components/carelux-ui";

import {
  createResident,
  updateResident,
  type ActionState,
} from "../actions";
import { residentSchema } from "../schemas/resident.schema";

type FacilityOption = {
  id: string;
  name: string;
};

type RoomOption = {
  id: string;
  facilityId: string;
  number: string;
};

type BedOption = {
  id: string;
  roomId: string;
  identifier: string;
  active: boolean;
  occupied: boolean;
};

type ResidentData = {
  id: string;
  facilityId: string;
  roomId: string | null;
  bedId: string | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender | null;
  admissionDate: string;
  status: ResidentStatus;
};

type ResidentFormOptions = {
  facilities: FacilityOption[];
  rooms: RoomOption[];
  beds: BedOption[];
  facilityLocked?: boolean;
};

type ResidentFormProps = ResidentFormOptions &
  (
    | {
        mode: "create";
        resident?: never;
      }
    | {
        mode: "edit";
        resident: ResidentData;
      }
  );

type ResidentFormInput = z.input<typeof residentSchema>;
type ResidentFormValues = z.output<typeof residentSchema>;
type ResidentFieldName = keyof ResidentFormValues;

const residentFieldNames: ResidentFieldName[] = [
  "facilityId",
  "roomId",
  "bedId",
  "firstName",
  "lastName",
  "birthDate",
  "gender",
  "admissionDate",
  "status",
];

const initialActionState: ActionState = {
  success: false,
  message: "",
};

const genderOptions = [
  { label: "Não indicado", value: null },
  { label: "Masculino", value: Gender.MALE },
  { label: "Feminino", value: Gender.FEMALE },
  { label: "Outro", value: Gender.OTHER },
] as const;

const statusOptions = [
  { label: "Ativo", value: ResidentStatus.ACTIVE },
  { label: "Hospitalizado", value: ResidentStatus.HOSPITALIZED },
  { label: "Alta", value: ResidentStatus.DISCHARGED },
  { label: "Falecido", value: ResidentStatus.DECEASED },
] as const;

function isLocationDisabled(status: ResidentStatus) {
  return (
    status === ResidentStatus.DISCHARGED ||
    status === ResidentStatus.DECEASED
  );
}

function parseDateInput(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function getDefaultValues(
  facilities: FacilityOption[],
  resident?: ResidentData
): ResidentFormValues {
  return {
    facilityId: resident?.facilityId ?? facilities[0]?.id ?? "",
    roomId: resident?.roomId ?? null,
    bedId: resident?.bedId ?? null,
    firstName: resident?.firstName ?? "",
    lastName: resident?.lastName ?? "",
    birthDate: parseDateInput(resident?.birthDate ?? ""),
    gender: resident?.gender ?? null,
    admissionDate: parseDateInput(resident?.admissionDate ?? ""),
    status: resident?.status ?? ResidentStatus.ACTIVE,
  };
}

function toFormData(values: ResidentFormValues) {
  const formData = new FormData();
  const locationDisabled = isLocationDisabled(values.status);

  formData.set("facilityId", values.facilityId);
  formData.set("roomId", locationDisabled ? "" : (values.roomId ?? ""));
  formData.set("bedId", locationDisabled ? "" : (values.bedId ?? ""));
  formData.set("firstName", values.firstName);
  formData.set("lastName", values.lastName);
  formData.set("birthDate", toDateInput(values.birthDate));
  formData.set("gender", values.gender ?? "");
  formData.set("admissionDate", toDateInput(values.admissionDate));
  formData.set("status", values.status);

  return formData;
}

function getServerFieldMessage(
  state: ActionState,
  field: ResidentFieldName
) {
  return state.errors?.[field]?.[0];
}

export function ResidentForm({
  mode,
  facilities,
  rooms,
  beds,
  resident,
  facilityLocked = false,
}: ResidentFormProps) {
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<ResidentFormInput, unknown, ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: getDefaultValues(facilities, resident),
    mode: "onChange",
  });

  const facilityId = useWatch({ control, name: "facilityId" });
  const watchedRoomId = useWatch({ control, name: "roomId" });
  const roomId = typeof watchedRoomId === "string" ? watchedRoomId : null;
  const status =
    useWatch({ control, name: "status" }) ?? ResidentStatus.ACTIVE;
  const locationDisabled = isLocationDisabled(status);
  const roomDisabled = locationDisabled || !facilityId;
  const bedDisabled = locationDisabled || !roomId;
  const availableRooms = rooms.filter(
    (room) => room.facilityId === facilityId
  );
  const availableBeds = beds.filter(
    (bed) =>
      bed.roomId === roomId &&
      ((bed.active && !bed.occupied) || bed.id === resident?.bedId)
  );
  const getFacilityName = (id: string) =>
    facilities.find((facility) => facility.id === id)?.name ?? "Lar";
  const getRoom = (id: string) => rooms.find((room) => room.id === id);
  const getRoomLabel = (room: RoomOption) =>
    `${getFacilityName(room.facilityId)} — Quarto ${room.number}`;
  const getBedLabel = (bed: BedOption) => {
    const room = getRoom(bed.roomId);

    return room
      ? `${getRoomLabel(room)} — Cama ${bed.identifier}`
      : `Cama ${bed.identifier}`;
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();

    try {
      const formData = toFormData(values);
      const result =
        mode === "edit"
          ? await updateResident(resident.id, initialActionState, formData)
          : await createResident(initialActionState, formData);

      for (const field of residentFieldNames) {
        const message = getServerFieldMessage(result, field);

        if (message) {
          setError(field, { message });
        }
      }

      setError("root", { message: result.message });
    } catch {
      setError("root", {
        message: "Não foi possível guardar o utente. Tente novamente.",
      });
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7">
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <FieldGroup className="grid gap-5 lg:grid-cols-2">
        <Field data-invalid={Boolean(errors.firstName)}>
          <FieldLabel htmlFor="resident-first-name">Nome</FieldLabel>
          <Input
            id="resident-first-name"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={
              errors.firstName ? "resident-first-name-error" : undefined
            }
            disabled={isSubmitting}
            {...register("firstName")}
          />
          {errors.firstName && (
            <FieldError
              id="resident-first-name-error"
              errors={[errors.firstName]}
            />
          )}
        </Field>

        <Field data-invalid={Boolean(errors.lastName)}>
          <FieldLabel htmlFor="resident-last-name">Apelido</FieldLabel>
          <Input
            id="resident-last-name"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={
              errors.lastName ? "resident-last-name-error" : undefined
            }
            disabled={isSubmitting}
            {...register("lastName")}
          />
          {errors.lastName && (
            <FieldError
              id="resident-last-name-error"
              errors={[errors.lastName]}
            />
          )}
        </Field>

        <Field data-invalid={Boolean(errors.birthDate)}>
          <FieldLabel htmlFor="resident-birth-date">
            Data de nascimento
          </FieldLabel>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <Input
                id="resident-birth-date"
                ref={field.ref}
                type="date"
                value={toDateInput(
                  field.value instanceof Date ? field.value : null
                )}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(parseDateInput(event.target.value))
                }
                aria-invalid={Boolean(errors.birthDate)}
                aria-describedby={
                  errors.birthDate ? "resident-birth-date-error" : undefined
                }
                disabled={isSubmitting}
              />
            )}
          />
          {errors.birthDate && (
            <FieldError
              id="resident-birth-date-error"
              errors={[errors.birthDate]}
            />
          )}
        </Field>

        <Field data-invalid={Boolean(errors.gender)}>
          <FieldLabel htmlFor="resident-gender">Género</FieldLabel>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                items={genderOptions}
                value={
                  field.value === Gender.MALE ||
                  field.value === Gender.FEMALE ||
                  field.value === Gender.OTHER
                    ? field.value
                    : null
                }
                onValueChange={(value) => field.onChange(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="resident-gender"
                  ref={field.ref}
                  aria-invalid={Boolean(errors.gender)}
                  aria-describedby={
                    errors.gender ? "resident-gender-error" : undefined
                  }
                >
                  <SelectValue placeholder="Não indicado" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem
                      key={option.value ?? "not-specified"}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <FieldError id="resident-gender-error" errors={[errors.gender]} />
          )}
        </Field>

        <Field data-invalid={Boolean(errors.admissionDate)}>
          <FieldLabel htmlFor="resident-admission-date">
            Data de admissão
          </FieldLabel>
          <Controller
            name="admissionDate"
            control={control}
            render={({ field }) => (
              <Input
                id="resident-admission-date"
                ref={field.ref}
                type="date"
                value={toDateInput(
                  field.value instanceof Date ? field.value : null
                )}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(parseDateInput(event.target.value))
                }
                aria-invalid={Boolean(errors.admissionDate)}
                aria-describedby={
                  errors.admissionDate
                    ? "resident-admission-date-error"
                    : undefined
                }
                disabled={isSubmitting}
              />
            )}
          />
          {errors.admissionDate && (
            <FieldError
              id="resident-admission-date-error"
              errors={[errors.admissionDate]}
            />
          )}
        </Field>

        <Field data-invalid={Boolean(errors.status)}>
          <FieldLabel htmlFor="resident-status">Estado</FieldLabel>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                items={statusOptions}
                value={field.value}
                onValueChange={(value) => {
                  if (value === null) {
                    return;
                  }

                  field.onChange(value);

                  if (isLocationDisabled(value)) {
                    setValue("roomId", null, { shouldValidate: true });
                    setValue("bedId", null, { shouldValidate: true });
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="resident-status"
                  ref={field.ref}
                  aria-invalid={Boolean(errors.status)}
                  aria-describedby={
                    errors.status ? "resident-status-error" : undefined
                  }
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <FieldError id="resident-status-error" errors={[errors.status]} />
          )}
        </Field>
      </FieldGroup>

      <FieldSet className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
        <FieldLegend className="px-2 text-sm">Localização</FieldLegend>
        <FieldGroup className="grid gap-5 lg:grid-cols-2">
          <Field
            className="lg:col-span-2"
            data-invalid={Boolean(errors.facilityId)}
            data-disabled={(facilityLocked || isSubmitting) || undefined}
          >
            <FieldLabel htmlFor="resident-facility">Lar</FieldLabel>
            <Controller
              name="facilityId"
              control={control}
              render={({ field }) => (
                <Select
                  items={facilities.map((facility) => ({
                    label: facility.name,
                    value: facility.id,
                  }))}
                  value={field.value}
                  onValueChange={(value) => {
                    const nextFacilityId = value ?? "";

                    if (nextFacilityId === field.value) {
                      return;
                    }

                    field.onChange(nextFacilityId);
                    setValue("roomId", null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue("bedId", null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  disabled={facilityLocked || isSubmitting}
                >
                  <SelectTrigger
                    id="resident-facility"
                    ref={field.ref}
                    aria-invalid={Boolean(errors.facilityId)}
                    aria-describedby={
                      errors.facilityId
                        ? "resident-facility-error"
                        : undefined
                    }
                  >
                    <SelectValue placeholder="Selecione um lar" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.facilityId && (
              <FieldError
                id="resident-facility-error"
                errors={[errors.facilityId]}
              />
            )}
          </Field>

          <Field
            data-invalid={Boolean(errors.roomId)}
            data-disabled={(roomDisabled || isSubmitting) || undefined}
          >
            <FieldLabel htmlFor="resident-room">Quarto</FieldLabel>
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => {
                const currentRoomId =
                  typeof field.value === "string" ? field.value : null;
                const roomOptions = [
                  { label: "Sem quarto", value: null },
                  ...availableRooms.map((room) => ({
                    label: getRoomLabel(room),
                    value: room.id,
                  })),
                ];

                return (
                  <Select
                    items={roomOptions}
                    value={currentRoomId}
                    onValueChange={(value) => {
                      const nextRoomId = value ?? null;

                      if (nextRoomId === currentRoomId) {
                        return;
                      }

                      field.onChange(nextRoomId);
                      setValue("bedId", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    disabled={roomDisabled || isSubmitting}
                  >
                    <SelectTrigger
                      id="resident-room"
                      ref={field.ref}
                      aria-invalid={Boolean(errors.roomId)}
                      aria-describedby={
                        errors.roomId ? "resident-room-error" : undefined
                      }
                    >
                      <SelectValue placeholder="Sem quarto" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map((option) => (
                        <SelectItem
                          key={option.value ?? "no-room"}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errors.roomId && (
              <FieldError id="resident-room-error" errors={[errors.roomId]} />
            )}
          </Field>

          <Field
            data-invalid={Boolean(errors.bedId)}
            data-disabled={(bedDisabled || isSubmitting) || undefined}
          >
            <FieldLabel htmlFor="resident-bed">Cama</FieldLabel>
            <Controller
              name="bedId"
              control={control}
              render={({ field }) => {
                const bedOptions = [
                  { label: "Sem cama", value: null },
                  ...availableBeds.map((bed) => ({
                    label: getBedLabel(bed),
                    value: bed.id,
                  })),
                ];

                return (
                  <Select
                    items={bedOptions}
                    value={
                      typeof field.value === "string" ? field.value : null
                    }
                    onValueChange={(value) => field.onChange(value)}
                    disabled={bedDisabled || isSubmitting}
                  >
                    <SelectTrigger
                      id="resident-bed"
                      ref={field.ref}
                      aria-invalid={Boolean(errors.bedId)}
                      aria-describedby={
                        errors.bedId ? "resident-bed-error" : undefined
                      }
                    >
                      <SelectValue placeholder="Sem cama" />
                    </SelectTrigger>
                    <SelectContent>
                      {bedOptions.map((option) => (
                        <SelectItem
                          key={option.value ?? "no-bed"}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errors.bedId && (
              <FieldError id="resident-bed-error" errors={[errors.bedId]} />
            )}
          </Field>
        </FieldGroup>

        {locationDisabled && (
          <p className="text-sm text-muted-foreground">
            Utentes com alta ou falecidos não podem ter quarto nem cama
            atribuídos.
          </p>
        )}
      </FieldSet>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={
            mode === "edit"
              ? `/dashboard/residents/${resident.id}`
              : "/dashboard/residents"
          }
          className="interactive-target inline-flex items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "A guardar..."
            : mode === "edit"
              ? "Guardar alterações"
              : "Criar utente"}
        </Button>
      </div>
    </form>
  );
}
