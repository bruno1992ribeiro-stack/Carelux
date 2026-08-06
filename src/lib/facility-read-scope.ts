import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
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

export async function getFacilityReadScope(): Promise<FacilityReadScope> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.clientId || !user.role || user.role.code === Role.SUPER_ADMIN) {
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
