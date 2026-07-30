import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentSession() {
  return await auth();
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
      role: true,
    },
  });
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