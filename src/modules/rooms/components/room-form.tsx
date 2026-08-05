"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/carelux-ui";

import { createRoom } from "../actions/create-room";
import type { RoomActionState } from "../actions/action-state";
import { updateRoom } from "../actions/update-room";
import { roomSchema } from "../schemas/room.schema";

type FacilityOption = {
  id: string;
  name: string;
};

type RoomData = {
  id: string;
  facilityId: string;
  number: string;
  floor: string | null;
  capacity: number;
  description: string | null;
};

type RoomFormProps =
  | {
      mode: "create";
      room?: never;
      facilities: FacilityOption[];
    }
  | {
      mode: "edit";
      room: RoomData;
      facilities: FacilityOption[];
    };

type RoomFormValues = z.infer<typeof roomSchema>;
type RoomFieldName = keyof RoomFormValues;

const roomFieldNames: RoomFieldName[] = [
  "facilityId",
  "number",
  "floor",
  "capacity",
  "description",
];

function getDefaultValues(room?: RoomData): RoomFormValues {
  return {
    facilityId: room?.facilityId ?? "",
    number: room?.number ?? "",
    floor: room?.floor ?? "",
    capacity: room?.capacity ?? 1,
    description: room?.description ?? "",
  };
}

function toFormData(values: RoomFormValues) {
  const formData = new FormData();

  formData.set("facilityId", values.facilityId);
  formData.set("number", values.number);
  formData.set("floor", values.floor ?? "");
  formData.set("capacity", String(values.capacity));
  formData.set("description", values.description ?? "");

  return formData;
}

function getServerFieldMessage(
  state: RoomActionState,
  field: RoomFieldName
) {
  return state.errors?.[field]?.[0];
}

export function RoomForm({ mode, facilities, room }: RoomFormProps) {
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: getDefaultValues(room),
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();

    try {
      const formData = toFormData(values);
      const result =
        mode === "edit"
          ? await updateRoom(room.id, formData)
          : await createRoom(formData);

      if (!result) {
        return;
      }

      for (const field of roomFieldNames) {
        const message = getServerFieldMessage(result, field);

        if (message) {
          setError(field, { message });
        }
      }

      setError("root", { message: result.message });
    } catch {
      setError("root", {
        message: "Não foi possível guardar o quarto. Tente novamente.",
      });
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6">
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.facilityId)}>
          <FieldLabel htmlFor="room-facility">Lar</FieldLabel>
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
                onValueChange={(value) => field.onChange(value ?? "")}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="room-facility"
                  ref={field.ref}
                  aria-invalid={Boolean(errors.facilityId)}
                  aria-describedby={
                    errors.facilityId ? "room-facility-error" : undefined
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
              id="room-facility-error"
              errors={[errors.facilityId]}
            />
          )}
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={Boolean(errors.number)}>
            <FieldLabel htmlFor="room-number">Número do quarto</FieldLabel>
            <Input
              id="room-number"
              autoComplete="off"
              aria-invalid={Boolean(errors.number)}
              aria-describedby={errors.number ? "room-number-error" : undefined}
              disabled={isSubmitting}
              {...register("number")}
            />
            {errors.number && (
              <FieldError id="room-number-error" errors={[errors.number]} />
            )}
          </Field>

          <Field data-invalid={Boolean(errors.floor)}>
            <FieldLabel htmlFor="room-floor">Piso</FieldLabel>
            <Input
              id="room-floor"
              autoComplete="off"
              aria-invalid={Boolean(errors.floor)}
              aria-describedby={errors.floor ? "room-floor-error" : undefined}
              disabled={isSubmitting}
              {...register("floor")}
            />
            {errors.floor && (
              <FieldError id="room-floor-error" errors={[errors.floor]} />
            )}
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.capacity)}>
          <FieldLabel htmlFor="room-capacity">Capacidade</FieldLabel>
          <Input
            id="room-capacity"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            aria-invalid={Boolean(errors.capacity)}
            aria-describedby={
              errors.capacity ? "room-capacity-error" : undefined
            }
            disabled={isSubmitting}
            {...register("capacity", {
              setValueAs: (value: unknown) => {
                if (value === "" || value === undefined) {
                  return undefined;
                }

                if (typeof value === "number") {
                  return value;
                }

                return Number(value);
              },
            })}
          />
          {errors.capacity && (
            <FieldError
              id="room-capacity-error"
              errors={[errors.capacity]}
            />
          )}
        </Field>

        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="room-description">Observações</FieldLabel>
          <Textarea
            id="room-description"
            rows={4}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "room-description-error" : undefined
            }
            disabled={isSubmitting}
            {...register("description")}
          />
          {errors.description && (
            <FieldError
              id="room-description-error"
              errors={[errors.description]}
            />
          )}
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "A guardar..."
            : mode === "edit"
              ? "Guardar alterações"
              : "Guardar quarto"}
        </Button>
      </div>
    </form>
  );
}
