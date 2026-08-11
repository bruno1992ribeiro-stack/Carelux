import { getFacilityReadScopeForUser } from "@/lib/facility-read-scope";
import { requirePermission } from "@/lib/permissions";
import { getCurrentClientUser } from "@/lib/session";
import type { Permission } from "@/modules/authorization/permissions";

export async function getClinicalAuthorization(permission: Permission) {
  const user = await getCurrentClientUser();
  requirePermission(user, permission);
  const facilityScope = getFacilityReadScopeForUser(user);
  return {
    user,
    scope: {
      clientId: facilityScope.clientId,
      facilityId: facilityScope.type === "facility" ? facilityScope.facilityId : undefined,
    },
  };
}
