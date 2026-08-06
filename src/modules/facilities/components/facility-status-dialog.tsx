"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/carelux-ui";

import {
  deactivateFacility,
  reactivateFacility,
  type FacilityStatusActionState,
} from "../actions/facility-status";

type FacilityStatusDialogProps = {
  facility: {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
  };
  compact?: boolean;
};

type FacilityStatusOperation = "deactivate" | "reactivate";

type FacilityStatusSnapshot = {
  id: string;
  name: string;
  operation: FacilityStatusOperation;
};

const initialState: FacilityStatusActionState = {
  success: false,
  message: "",
};

function SubmitButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={
        active
          ? "bg-destructive text-white shadow-none hover:bg-destructive/90"
          : undefined
      }
    >
      {pending
        ? active
          ? "A desativar..."
          : "A reativar..."
        : active
          ? "Confirmar desativação"
          : "Confirmar reativação"}
    </Button>
  );
}

export function FacilityStatusDialog({
  facility,
  compact = false,
}: FacilityStatusDialogProps) {
  const active = facility.status === "ACTIVE";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [snapshot, setSnapshot] = useState<FacilityStatusSnapshot | null>(null);
  const refreshAfterClose = useRef(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setSnapshot({
          id: facility.id,
          name: facility.name,
          operation: active ? "deactivate" : "reactivate",
        });
        setOpen(true);
        return;
      }

      setOpen(false);
      setSnapshot(null);
      setContentKey((current) => current + 1);
    },
    [active, facility.id, facility.name]
  );

  const handleSuccess = useCallback(() => {
    refreshAfterClose.current = true;
    setOpen(false);
    setSnapshot(null);
    setContentKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!open && refreshAfterClose.current) {
      refreshAfterClose.current = false;
      router.refresh();
    }
  }, [open, router]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            className={
              active
                ? "border border-destructive/30 bg-transparent text-destructive shadow-none hover:bg-destructive/10"
                : "border border-primary/30 bg-transparent text-primary shadow-none hover:bg-primary/10"
            }
          />
        }
      >
        {active ? "Desativar" : "Reativar"}
      </DialogTrigger>

      {open && snapshot && (
        <FacilityStatusDialogContent
          key={`${snapshot.operation}-${contentKey}`}
          facilityId={snapshot.id}
          facilityName={snapshot.name}
          operation={snapshot.operation}
          compact={compact}
          onSuccess={handleSuccess}
        />
      )}
    </Dialog>
  );
}

type FacilityStatusDialogContentProps = {
  facilityId: string;
  facilityName: string;
  operation: FacilityStatusOperation;
  compact?: boolean;
  onSuccess: () => void;
};

function FacilityStatusDialogContent({
  facilityId,
  facilityName,
  operation,
  compact = false,
  onSuccess,
}: FacilityStatusDialogContentProps) {
  const active = operation === "deactivate";
  const action = active ? deactivateFacility : reactivateFacility;
  const [state, formAction] = useActionState(
    action.bind(null, facilityId),
    initialState
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [onSuccess, state.success]);

  return (
    <DialogContent className={compact ? "max-w-md" : undefined}>
        <DialogHeader>
          <DialogTitle>
            {active ? "Desativar unidade" : "Reativar unidade"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {active
              ? `Confirma a desativação de “${facilityName}”? Os dados serão preservados, mas a unidade deixará de aceitar novas atribuições e operações.`
              : `Confirma a reativação de “${facilityName}”? A unidade voltará a aceitar novas atribuições e operações.`}
          </p>

          {active && (
            <p className="text-sm text-muted-foreground">
              A operação será bloqueada se esta for a última unidade ativa ou se
              ainda existirem contas, funcionários ou utentes com vínculo
              ativo.
            </p>
          )}

          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              aria-live="polite"
              className={
                state.success
                  ? "rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary"
                  : "rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              }
            >
              {state.message}
            </p>
          )}

          {!state.success && (
            <form action={formAction} className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <DialogClose
                render={
                  <Button className="border border-border bg-transparent text-foreground shadow-none hover:bg-muted" />
                }
              >
                Cancelar
              </DialogClose>
              <SubmitButton active={active} />
            </form>
          )}
        </div>
    </DialogContent>
  );
}
