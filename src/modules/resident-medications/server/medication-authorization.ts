import { getFacilityReadScopeForUser } from "@/lib/facility-read-scope";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { getCurrentClientUser } from "@/lib/session";
import { Permission } from "@/modules/authorization/permissions";

async function getMedicationAuthorization(permission: Permission) {
  const user = await getCurrentClientUser();
  requirePermission(user, permission);
  const facilityScope = getFacilityReadScopeForUser(user);

  return {
    user,
    canEdit: hasPermission(user, Permission.EDIT_MEDICATION),
    scope: {
      clientId: facilityScope.clientId,
      facilityId:
        facilityScope.type === "facility" ? facilityScope.facilityId : undefined,
    },
  };
}

export function getMedicationReadAuthorization() {
  return getMedicationAuthorization(Permission.VIEW_MEDICATION);
}

export function getMedicationEditAuthorization() {
  return getMedicationAuthorization(Permission.EDIT_MEDICATION);
}
