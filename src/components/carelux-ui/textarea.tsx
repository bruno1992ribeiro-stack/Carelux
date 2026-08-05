import { forwardRef, type ComponentProps } from "react";

import { Textarea as TextareaPrimitive } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type TextareaProps = ComponentProps<typeof TextareaPrimitive>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <TextareaPrimitive
        ref={ref}
        className={cn(
          "min-h-24 resize-y rounded-xl border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
