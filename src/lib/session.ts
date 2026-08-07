import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGlobalSuperAdmin } from "@/lib/user-scope";

export async function getCurrentSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      client: true,
      facility: true,
      role: {
        include: {
          permissions: {
            select: {
              permission: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function requireGlobalSuperAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isGlobalSuperAdmin(user)) {
    notFound();
  }

  return user;
}

export async function getCurrentClientUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (isGlobalSuperAdmin(user)) {
    redirect("/admin");
  }

  if (!user.clientId || !user.client || !user.role) {
    notFound();
  }

  if (user.role.clientId !== null && user.role.clientId !== user.clientId) {
    notFound();
  }

  return {
    ...user,
    clientId: user.clientId,
    client: user.client,
    role: user.role,
  };
}

export async function getCurrentClient() {
  const user = await getCurrentUser();

  return user?.client ?? null;
}

export async function getCurrentFacility() {
  const user = await getCurrentUser();

  return user?.facility ?? null;
}

export async function getCurrentRole() {
  const user = await getCurrentUser();

  return user?.role ?? null;
}
