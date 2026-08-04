"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogTitle = BaseDialog.Title;

type DialogContentProps = Omit<
  ComponentProps<typeof BaseDialog.Popup>,
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
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity" />
      <BaseDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <BaseDialog.Popup
          className={twMerge(
            "card-warm relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto p-6",
            className
          )}
          {...props}
        >
          {children}
          <BaseDialog.Close
            aria-label="Fechar"
            className="interactive-target absolute right-3 top-3 rounded-xl text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
          >
            <X aria-hidden="true" size={20} />
          </BaseDialog.Close>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={twMerge("mb-6 space-y-1 pr-12", className)}
      {...props}
    />
  );
}
