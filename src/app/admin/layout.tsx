import type { ReactNode } from "react";

import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/session";
import { Role } from "@/modules/authorization/roles";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role?.code !== Role.SUPER_ADMIN ||
    user.role.clientId !== null ||
    user.clientId !== null ||
    user.facilityId !== null
  ) {
    notFound();
  }

  return children;
}
