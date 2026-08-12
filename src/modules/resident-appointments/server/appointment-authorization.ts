import { getFacilityReadScopeForUser } from "@/lib/facility-read-scope";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { getCurrentClientUser } from "@/lib/session";
import { Permission } from "@/modules/authorization/permissions";

export async function getAppointmentAuthorization(permission: Permission) {
  const user = await getCurrentClientUser();
  requirePermission(user, permission);
  const facilityScope = getFacilityReadScopeForUser(user);

  return {
    user,
    canEdit: hasPermission(user, Permission.EDIT_APPOINTMENT),
    scope: {
      clientId: facilityScope.clientId,
      facilityId:
        facilityScope.type === "facility" ? facilityScope.facilityId : undefined,
    },
  };
}
