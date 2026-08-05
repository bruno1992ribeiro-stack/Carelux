import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";

export type BedActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export function getBedActionError(error: unknown): BedActionState {
  if (error instanceof z.ZodError) {
    const fieldErrors = error.flatten().fieldErrors;

    return {
      success: false,
      message: "Verifique os campos indicados.",
      errors: Object.fromEntries(
        Object.entries(fieldErrors).filter(
          (entry): entry is [string, string[]] => Boolean(entry[1])
        )
      ),
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: false,
    message: "Não foi possível guardar a cama. Tente novamente.",
  };
}
