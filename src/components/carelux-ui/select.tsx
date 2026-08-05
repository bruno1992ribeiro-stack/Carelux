"use client";

import type { ComponentProps } from "react";

import {
  Select as SelectPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive;
export const SelectValue = SelectValuePrimitive;

export function SelectTrigger({
  className,
  ...props
}: ComponentProps<typeof SelectTriggerPrimitive>) {
  return (
    <SelectTriggerPrimitive
      className={cn(
        "min-h-11 w-full rounded-xl border-border bg-input px-4 py-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function SelectContent({
  className,
  ...props
}: ComponentProps<typeof SelectContentPrimitive>) {
  return (
    <SelectContentPrimitive
      className={cn("rounded-xl border border-border bg-card", className)}
      {...props}
    />
  );
}

export function SelectItem({
  className,
  ...props
}: ComponentProps<typeof SelectItemPrimitive>) {
  return (
    <SelectItemPrimitive
      className={cn(
        "min-h-11 rounded-xl text-foreground focus:bg-primary/10 focus:text-foreground",
        className
      )}
      {...props}
    />
  );
}
