import type { Prisma } from "@prisma/client";

import { Role } from "@/modules/authorization/roles";

export type UserScopeIdentity = {
  clientId: string | null;
  facilityId: string | null;
  role?: {
    code: string;
    clientId: string | null;
  } | null;
};

type UserScopeDatabase = Pick<Prisma.TransactionClient, "facility" | "role">;

export type UserScopeInput = {
  clientId: string | null;
  facilityId: string | null;
  roleId: string;
};

export function isGlobalSuperAdmin(
  user: UserScopeIdentity | null | undefined,
): boolean {
  return Boolean(
    user?.role?.code === Role.SUPER_ADMIN &&
      user.role.clientId === null &&
      user.clientId === null &&
      user.facilityId === null,
  );
}

export async function validateUserScope(
  db: UserScopeDatabase,
  input: UserScopeInput,
): Promise<void> {
  const role = await db.role.findUnique({
    where: { id: input.roleId },
    select: { code: true, clientId: true },
  });

  if (!role) {
    throw new Error("Perfil não encontrado.");
  }

  if (role.code === Role.SUPER_ADMIN) {
    if (
      role.clientId !== null ||
      input.clientId !== null ||
      input.facilityId !== null
    ) {
      throw new Error(
        "O SUPER_ADMIN global não pode estar associado a cliente ou unidade.",
      );
    }

    return;
  }

  if (!input.clientId) {
    throw new Error("Utilizadores tenant têm de estar associados a um cliente.");
  }

  if (role.clientId !== null && role.clientId !== input.clientId) {
    throw new Error("O perfil não pertence ao cliente do utilizador.");
  }

  if (input.facilityId) {
    const facility = await db.facility.findFirst({
      where: {
        id: input.facilityId,
        clientId: input.clientId,
      },
      select: { id: true },
    });

    if (!facility) {
      throw new Error("A unidade não pertence ao cliente do utilizador.");
    }
  }
}
