"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
} from "@/components/carelux-ui";

import type { BedActionState } from "../actions/action-state";
import { createBed } from "../actions/create-bed";
import { updateBed } from "../actions/update-bed";
import { bedSchema } from "../schemas/bed.schema";

type RoomOption = {
  id: string;
  number: string;
  facility: {
    name: string;
  };
};

type BedData = {
  id: string;
  roomId: string;
  identifier: string;
  active: boolean;
  occupied: boolean;
};

type BedFormProps =
  | {
      mode: "create";
      bed?: never;
      rooms: RoomOption[];
    }
  | {
      mode: "edit";
      bed: BedData;
      rooms: RoomOption[];
    };

type BedFormValues = z.infer<typeof bedSchema>;
type BedFieldName = keyof BedFormValues;

const bedFieldNames: BedFieldName[] = [
  "roomId",
  "identifier",
  "active",
  "occupied",
];

function getRoomLabel(room: RoomOption) {
  return `${room.facility.name} — Quarto ${room.number}`;
}

function getDefaultValues(bed?: BedData): BedFormValues {
  return {
    roomId: bed?.roomId ?? "",
    identifier: bed?.identifier ?? "",
    active: bed?.active ?? true,
    occupied: bed?.occupied ?? false,
  };
}

function toFormData(values: BedFormValues) {
  const formData = new FormData();

  formData.set("roomId", values.roomId);
  formData.set("identifier", values.identifier);

  if (values.active) {
    formData.set("active", "on");
  }

  if (values.occupied) {
    formData.set("occupied", "on");
  }

  return formData;
}

function getServerFieldMessage(
  state: BedActionState,
  field: BedFieldName
) {
  return state.errors?.[field]?.[0];
}

export function BedForm({ mode, rooms, bed }: BedFormProps) {
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<BedFormValues>({
    resolver: zodResolver(bedSchema),
    defaultValues: getDefaultValues(bed),
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();

    try {
      const formData = toFormData(values);
      const result =
        mode === "edit"
          ? await updateBed(bed.id, formData)
          : await createBed(formData);

      if (!result) {
        return;
      }

      for (const field of bedFieldNames) {
        const message = getServerFieldMessage(result, field);

        if (message) {
          setError(field, { message });
        }
      }

      setError("root", { message: result.message });
    } catch {
      setError("root", {
        message: "Não foi possível guardar a cama. Tente novamente.",
      });
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.roomId)}>
          <FieldLabel htmlFor="bed-room">Quarto</FieldLabel>
          <Controller
            name="roomId"
            control={control}
            render={({ field }) => (
              <Select
                items={rooms.map((room) => ({
                  label: getRoomLabel(room),
                  value: room.id,
                }))}
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "")}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="bed-room"
                  ref={field.ref}
                  aria-invalid={Boolean(errors.roomId)}
                  aria-describedby={errors.roomId ? "bed-room-error" : undefined}
                >
                  <SelectValue placeholder="Selecione um quarto" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {getRoomLabel(room)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.roomId && (
            <FieldError id="bed-room-error" errors={[errors.roomId]} />
          )}
        </Field>

        <Field data-invalid={Boolean(errors.identifier)}>
          <FieldLabel htmlFor="bed-identifier">Identificador da cama</FieldLabel>
          <Input
            id="bed-identifier"
            type="text"
            autoComplete="off"
            placeholder="Ex.: A, B, 1 ou 2"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={
              errors.identifier ? "bed-identifier-error" : undefined
            }
            disabled={isSubmitting}
            {...register("identifier")}
          />
          {errors.identifier && (
            <FieldError
              id="bed-identifier-error"
              errors={[errors.identifier]}
            />
          )}
        </Field>

        <FieldGroup className="rounded-xl border border-border p-4">
          <Field
            data-invalid={Boolean(errors.active)}
            data-disabled={isSubmitting || undefined}
          >
            <FieldLabel
              htmlFor="bed-active"
              className="min-h-11 w-full cursor-pointer items-center gap-3 group-data-[disabled=true]/field:cursor-not-allowed"
            >
              <Input
                id="bed-active"
                type="checkbox"
                className="min-h-0 size-5 shrink-0 rounded-md p-0"
                aria-invalid={Boolean(errors.active)}
                aria-describedby={
                  errors.active ? "bed-active-error" : undefined
                }
                disabled={isSubmitting}
                {...register("active")}
              />
              <span>Cama ativa</span>
            </FieldLabel>
            {errors.active && (
              <FieldError id="bed-active-error" errors={[errors.active]} />
            )}
          </Field>

          <Field
            data-invalid={Boolean(errors.occupied)}
            data-disabled={isSubmitting || undefined}
          >
            <FieldLabel
              htmlFor="bed-occupied"
              className="min-h-11 w-full cursor-pointer items-center gap-3 group-data-[disabled=true]/field:cursor-not-allowed"
            >
              <Input
                id="bed-occupied"
                type="checkbox"
                className="min-h-0 size-5 shrink-0 rounded-md p-0"
                aria-invalid={Boolean(errors.occupied)}
                aria-describedby={
                  errors.occupied ? "bed-occupied-error" : undefined
                }
                disabled={isSubmitting}
                {...register("occupied")}
              />
              <span>Cama ocupada</span>
            </FieldLabel>
            {errors.occupied && (
              <FieldError
                id="bed-occupied-error"
                errors={[errors.occupied]}
              />
            )}
          </Field>
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/beds"
          className="interactive-target inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          Cancelar
        </Link>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "A guardar..."
            : mode === "edit"
              ? "Guardar alterações"
              : "Guardar cama"}
        </Button>
      </div>
    </form>
  );
}
