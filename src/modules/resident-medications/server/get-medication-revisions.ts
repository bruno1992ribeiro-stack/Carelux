"use server";

import { notFound } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";

import {
  medicationIdSchema,
  medicationResidentIdSchema,
} from "../schemas/resident-medication.schema";
import { residentMedicationService } from "../services/resident-medication.service";
import { getMedicationReadAuthorization } from "./medication-authorization";

export async function getMedicationRevisions(
  residentId: string,
  medicationId: string,
) {
  const residentIdResult = medicationResidentIdSchema.safeParse(residentId);
  const medicationIdResult = medicationIdSchema.safeParse(medicationId);

  if (!residentIdResult.success || !medicationIdResult.success) {
    notFound();
  }

  let authorization: Awaited<
    ReturnType<typeof getMedicationReadAuthorization>
  >;

  try {
    authorization = await getMedicationReadAuthorization();
  } catch (error) {
    if (error instanceof AppError && error.status === 403) {
      notFound();
    }

    throw error;
  }

  try {
    return await residentMedicationService.getRevisions(
      residentIdResult.data,
      medicationIdResult.data,
      authorization.scope,
    );
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
