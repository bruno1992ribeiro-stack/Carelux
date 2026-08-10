import { cache } from "react";

import { notFound } from "next/navigation";

import { getFacilityReadScopeForUser } from "@/lib/facility-read-scope";
import { hasPermission } from "@/lib/permissions";
import { getCurrentClientUser } from "@/lib/session";
import { Permission } from "@/modules/authorization/permissions";

const getResidentUser = cache(async () => {
  return getCurrentClientUser();
});

export const requireResidentPermission = cache(
  async (permission: Permission) => {
    const user = await getResidentUser();

    if (!hasPermission(user, permission)) {
      notFound();
    }

    return getFacilityReadScopeForUser(user);
  },
);

export const getResidentReadScope = cache(() =>
  requireResidentPermission(Permission.VIEW_RESIDENT),
);

export const getResidentListAuthorization = cache(async () => {
  const user = await getResidentUser();

  if (!hasPermission(user, Permission.VIEW_RESIDENT)) {
    notFound();
  }

  return {
    canCreate: hasPermission(user, Permission.CREATE_RESIDENT),
    canEdit: hasPermission(user, Permission.EDIT_RESIDENT),
    scope: getFacilityReadScopeForUser(user),
  };
});
