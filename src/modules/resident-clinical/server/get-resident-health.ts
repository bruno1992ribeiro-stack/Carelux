import { cache } from "react";

import { hasPermission } from "@/lib/permissions";
import { Permission } from "@/modules/authorization/permissions";

import { residentClinicalService } from "../services/resident-clinical.service";
import { getClinicalAuthorization } from "./clinical-authorization";

export const getResidentHealth = cache(async (residentId: string) => {
  const { user, scope } = await getClinicalAuthorization(Permission.VIEW_CLINICAL_RECORD);
  const health = await residentClinicalService.getHealth(residentId, scope);
  return {
    ...health,
    alerts: health.allergies.filter(
      (allergy) => allergy.status === "ACTIVE" && (allergy.severity === "SEVERE" || allergy.severity === "LIFE_THREATENING"),
    ),
    authorization: {
      canEditAllergies: hasPermission(user, Permission.EDIT_ALLERGY),
      canEditClinicalRecords: hasPermission(user, Permission.EDIT_CLINICAL_RECORD),
      canEditDiagnoses: hasPermission(user, Permission.EDIT_PATHOLOGY),
    },
  };
});
