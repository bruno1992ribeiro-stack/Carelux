import type { ReactNode } from "react";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <main className="min-h-screen bg-slate-100 p-6">
      <PageContainer>
        <div className="grid grid-cols-[280px_1fr] gap-6">
          <Sidebar currentRole={role.label} />

          <div>
            {children}
          </div>
        </div>
      </PageContainer>
    </main>
  );
}