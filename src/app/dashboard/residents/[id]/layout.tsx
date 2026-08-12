import type { ReactNode } from "react";

import { ResidentWorkspaceHeader } from "@/components/dashboard/residents/resident-workspace-header";
import { ResidentWorkspaceNavigation } from "@/components/dashboard/residents/resident-workspace-navigation";
import { getResidentWorkspace } from "@/modules/residents/server/get-resident-workspace";
import { getResidentListAuthorization } from "@/modules/residents/server/resident-authorization";

type ResidentLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ResidentLayout({
  children,
  params,
}: ResidentLayoutProps) {
  const { id } = await params;
  const [resident, authorization] = await Promise.all([
    getResidentWorkspace(id),
    getResidentListAuthorization(),
  ]);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <ResidentWorkspaceHeader
        canEdit={authorization.canEdit}
        resident={resident}
      />
      <ResidentWorkspaceNavigation
        canViewAppointments={authorization.canViewAppointments}
        canViewClinical={authorization.canViewClinical}
        residentId={resident.id}
      />
      {children}
    </div>
  );
}
