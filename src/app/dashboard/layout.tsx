import type { ReactNode } from "react";

import { notFound, redirect } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@/modules/authorization/roles";
import { getRoleById } from "@/services/role-service";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role?.code === Role.SUPER_ADMIN &&
    user.role.clientId === null &&
    user.clientId === null &&
    user.facilityId === null
  ) {
    redirect("/admin");
  }

  if (!user.clientId || !user.client) {
    notFound();
  }

  const role = getRoleById("administrator");

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <Sidebar currentRole={role.label} />

      <main className="min-w-0 pb-[calc(5.8rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[19.5rem]">
        <PageContainer className="py-5 sm:py-6 lg:py-8">
          {children}
        </PageContainer>
      </main>
    </div>
  );
}
