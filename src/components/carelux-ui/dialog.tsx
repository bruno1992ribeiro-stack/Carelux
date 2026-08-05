"use client";

import { X } from "lucide-react";
import type { ComponentProps } from "react";

import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogViewport,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export { Dialog, DialogClose, DialogTitle, DialogTrigger };

type DialogContentProps = Omit<
  ComponentProps<typeof DialogPopup>,
  "className"
> & {
  className?: string;
};

export function DialogContent({
  children,
  className,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay className="fixed inset-0 z-40 bg-black/40 transition-opacity supports-backdrop-filter:backdrop-blur-none" />
      <DialogViewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <DialogPopup
          className={cn(
            "card-warm relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto p-6",
            className
          )}
          {...props}
        >
          {children}
          <DialogClose
            aria-label="Fechar"
            className="interactive-target absolute right-3 top-3 rounded-xl text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
          >
            <X aria-hidden="true" size={20} />
          </DialogClose>
        </DialogPopup>
      </DialogViewport>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-6 space-y-1 pr-12", className)}
      {...props}
    />
  );
}
