import type { ComponentProps } from "react";

import { Label as LabelPrimitive } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
