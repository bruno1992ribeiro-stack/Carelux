"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@/components/carelux-ui";

import { createFacility } from "../actions/create-facility";
import { updateFacility } from "../actions/update-facility";
import { facilitySchema } from "../schemas/facility.schema";

type FacilityData = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
};

type FacilityFormProps =
  | {
      mode: "create";
      facility?: never;
    }
  | {
      mode: "edit";
      facility: FacilityData;
    };

type FacilityFormValues = z.infer<typeof facilitySchema>;

function getDefaultValues(facility?: FacilityData): FacilityFormValues {
  return {
    name: facility?.name ?? "",
    city: facility?.city ?? "",
    address: facility?.address ?? "",
    postalCode: facility?.postalCode ?? "",
    phone: facility?.phone ?? "",
    email: facility?.email ?? "",
  };
}

function toFormData(values: FacilityFormValues) {
  const formData = new FormData();

  formData.set("name", values.name);
  formData.set("city", values.city ?? "");
  formData.set("address", values.address ?? "");
  formData.set("postalCode", values.postalCode ?? "");
  formData.set("phone", values.phone ?? "");
  formData.set("email", values.email ?? "");

  return formData;
}

export function FacilityForm({ mode, facility }: FacilityFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: getDefaultValues(facility),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const formData = toFormData(values);

      if (mode === "edit") {
        await updateFacility(facility.id, formData);
      } else {
        await createFacility(formData);
      }
    } catch {
      setError("root", {
        message: "Não foi possível guardar a unidade. Tente novamente.",
      });
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6">
      <h2 className="font-display text-xl font-normal text-foreground">
        {mode === "edit" ? "Editar unidade" : "Nova unidade"}
      </h2>

      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="facility-name">Nome</FieldLabel>
          <Input
            id="facility-name"
            autoComplete="organization"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "facility-name-error" : undefined}
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && (
            <FieldError id="facility-name-error" errors={[errors.name]} />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.city)}>
            <FieldLabel htmlFor="facility-city">Localidade</FieldLabel>
            <Input
              id="facility-city"
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? "facility-city-error" : undefined}
              disabled={isSubmitting}
              {...register("city")}
            />
            {errors.city && (
              <FieldError id="facility-city-error" errors={[errors.city]} />
            )}
          </Field>

          <Field data-invalid={Boolean(errors.postalCode)}>
            <FieldLabel htmlFor="facility-postal-code">
              Código postal
            </FieldLabel>
            <Input
              id="facility-postal-code"
              autoComplete="postal-code"
              aria-invalid={Boolean(errors.postalCode)}
              aria-describedby={
                errors.postalCode ? "facility-postal-code-error" : undefined
              }
              disabled={isSubmitting}
              {...register("postalCode")}
            />
            {errors.postalCode && (
              <FieldError
                id="facility-postal-code-error"
                errors={[errors.postalCode]}
              />
            )}
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.address)}>
          <FieldLabel htmlFor="facility-address">Morada</FieldLabel>
          <Input
            id="facility-address"
            autoComplete="street-address"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={
              errors.address ? "facility-address-error" : undefined
            }
            disabled={isSubmitting}
            {...register("address")}
          />
          {errors.address && (
            <FieldError id="facility-address-error" errors={[errors.address]} />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.phone)}>
            <FieldLabel htmlFor="facility-phone">Telefone</FieldLabel>
            <Input
              id="facility-phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "facility-phone-error" : undefined}
              disabled={isSubmitting}
              {...register("phone")}
            />
            {errors.phone && (
              <FieldError id="facility-phone-error" errors={[errors.phone]} />
            )}
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="facility-email">Email</FieldLabel>
            <Input
              id="facility-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "facility-email-error" : undefined}
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && (
              <FieldError id="facility-email-error" errors={[errors.email]} />
            )}
          </Field>
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "A guardar..."
            : mode === "edit"
              ? "Guardar alterações"
              : "Guardar unidade"}
        </Button>
      </div>
    </form>
  );
}
