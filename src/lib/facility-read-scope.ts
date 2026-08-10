import { notFound } from "next/navigation";

import { getCurrentClientUser } from "@/lib/session";
import { Role } from "@/modules/authorization/roles";

export type FacilityReadScope =
  | {
      type: "client";
      clientId: string;
    }
  | {
      type: "facility";
      clientId: string;
      facilityId: string;
    };

export function getFacilityReadScopeForUser(
  user: Awaited<ReturnType<typeof getCurrentClientUser>>,
): FacilityReadScope {
  if (user.role.code === Role.SUPER_ADMIN) {
    notFound();
  }

  if (user.role.code === Role.ADMIN) {
    return {
      type: "client",
      clientId: user.clientId,
    };
  }

  if (!user.facilityId) {
    notFound();
  }

  return {
    type: "facility",
    clientId: user.clientId,
    facilityId: user.facilityId,
  };
}

export async function getFacilityReadScope(): Promise<FacilityReadScope> {
  return getFacilityReadScopeForUser(await getCurrentClientUser());
}
