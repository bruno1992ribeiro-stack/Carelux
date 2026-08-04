import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { PageContainer } from "@/components/PageContainer";
import { getRoleById } from "@/services/role-service";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = getRoleById("administrator");

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <Sidebar currentRole={role.label} />

      <main className="min-w-0 lg:pl-[19.5rem]">
        <PageContainer className="py-5 sm:py-6 lg:py-8">
          {children}
        </PageContainer>
      </main>
    </div>
  );
}
