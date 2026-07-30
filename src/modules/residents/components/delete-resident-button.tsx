"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteResident } from "../actions";

type DeleteResidentButtonProps = {
  residentId: string;
  redirectAfterDelete?: boolean;
  className?: string;
};

export function DeleteResidentButton({
  residentId,
  redirectAfterDelete = false,
  className,
}: DeleteResidentButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    if (!window.confirm("Tem a certeza de que pretende eliminar este utente?")) {
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const result = await deleteResident(residentId);

        if (!result.success) {
          setError(result.message);
          return;
        }

        if (redirectAfterDelete) {
          router.push("/dashboard/residents");
          return;
        }

        router.refresh();
      } catch {
        setError("Não foi possível eliminar o utente.");
      }
    });
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className={
          className ??
          "inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
        }
      >
        {pending ? "A eliminar..." : "Eliminar"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
