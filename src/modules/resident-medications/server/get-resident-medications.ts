import { notFound } from "next/navigation";
import { cache } from "react";

import { AppError } from "@/lib/errors/app-error";

import { medicationResidentIdSchema } from "../schemas/resident-medication.schema";
import { residentMedicationService } from "../services/resident-medication.service";
import { getMedicationReadAuthorization } from "./medication-authorization";

export const getResidentMedications = cache(async (residentId: string) => {
  const validatedResidentId = medicationResidentIdSchema.parse(residentId);
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
    const medications = await residentMedicationService.listByResident(
      validatedResidentId,
      authorization.scope,
    );

    return {
      residentId: validatedResidentId,
      medications,
      authorization: {
        canView: true,
        canEdit: authorization.canEdit,
      },
    };
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }

    throw error;
  }
});
