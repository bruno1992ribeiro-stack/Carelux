import type { ComponentProps } from "react";

import {
  Field as FieldPrimitive,
  FieldContent as FieldContentPrimitive,
  FieldDescription as FieldDescriptionPrimitive,
  FieldError as FieldErrorPrimitive,
  FieldGroup as FieldGroupPrimitive,
  FieldLabel as FieldLabelPrimitive,
  FieldLegend as FieldLegendPrimitive,
  FieldSeparator as FieldSeparatorPrimitive,
  FieldSet as FieldSetPrimitive,
  FieldTitle as FieldTitlePrimitive,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function Field({ className, ...props }: ComponentProps<typeof FieldPrimitive>) {
  return <FieldPrimitive className={cn("gap-2", className)} {...props} />;
}

export function FieldContent({ className, ...props }: ComponentProps<typeof FieldContentPrimitive>) {
  return <FieldContentPrimitive className={cn("gap-1.5", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: ComponentProps<typeof FieldDescriptionPrimitive>) {
  return <FieldDescriptionPrimitive className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

export function FieldError({ className, ...props }: ComponentProps<typeof FieldErrorPrimitive>) {
  return <FieldErrorPrimitive className={cn("text-xs", className)} {...props} />;
}

export function FieldGroup({ className, ...props }: ComponentProps<typeof FieldGroupPrimitive>) {
  return <FieldGroupPrimitive className={cn("gap-5", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: ComponentProps<typeof FieldLabelPrimitive>) {
  return <FieldLabelPrimitive className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}

export function FieldLegend({ className, ...props }: ComponentProps<typeof FieldLegendPrimitive>) {
  return <FieldLegendPrimitive className={cn("text-foreground", className)} {...props} />;
}

export function FieldSeparator({ className, ...props }: ComponentProps<typeof FieldSeparatorPrimitive>) {
  return <FieldSeparatorPrimitive className={cn("text-muted-foreground", className)} {...props} />;
}

export function FieldSet({ className, ...props }: ComponentProps<typeof FieldSetPrimitive>) {
  return <FieldSetPrimitive className={cn("gap-5", className)} {...props} />;
}

export function FieldTitle({ className, ...props }: ComponentProps<typeof FieldTitlePrimitive>) {
  return <FieldTitlePrimitive className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}
