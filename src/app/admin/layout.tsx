import type { ReactNode } from "react";

import { connection } from "next/server";

import { requireGlobalSuperAdmin } from "@/lib/session";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await connection();

  await requireGlobalSuperAdmin();

  return children;
}
