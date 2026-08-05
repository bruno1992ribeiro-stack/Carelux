"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Button as ButtonPrimitive } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, type = "button", ...props }, ref) {
    return (
      <ButtonPrimitive
        ref={ref}
        type={type}
        className={cn(
          "interactive-target rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
