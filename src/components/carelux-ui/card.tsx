import type { ComponentProps } from "react";

import {
  Card as CardPrimitive,
  CardAction as CardActionPrimitive,
  CardContent as CardContentPrimitive,
  CardDescription as CardDescriptionPrimitive,
  CardFooter as CardFooterPrimitive,
  CardHeader as CardHeaderPrimitive,
  CardTitle as CardTitlePrimitive,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<typeof CardPrimitive>) {
  return <CardPrimitive className={cn("card-warm gap-0 py-0", className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<typeof CardHeaderPrimitive>) {
  return <CardHeaderPrimitive className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<typeof CardTitlePrimitive>) {
  return <CardTitlePrimitive className={cn("font-display text-lg font-normal", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<typeof CardDescriptionPrimitive>) {
  return <CardDescriptionPrimitive className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardAction({ className, ...props }: ComponentProps<typeof CardActionPrimitive>) {
  return <CardActionPrimitive className={cn(className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<typeof CardContentPrimitive>) {
  return <CardContentPrimitive className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<typeof CardFooterPrimitive>) {
  return <CardFooterPrimitive className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}
