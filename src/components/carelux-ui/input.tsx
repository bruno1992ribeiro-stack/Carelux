import { forwardRef, type ComponentProps } from "react";

import { Input as InputPrimitive } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type InputProps = ComponentProps<typeof InputPrimitive>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <InputPrimitive
      ref={ref}
      className={cn(
        "min-h-11 rounded-xl border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
