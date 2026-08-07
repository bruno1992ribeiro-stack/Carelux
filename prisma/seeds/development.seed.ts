import bcrypt from "bcrypt";

import { Role } from "../../src/modules/authorization/roles";
import { prisma } from "../../src/lib/prisma";
import { validateUserScope } from "../../src/lib/user-scope";

export interface DevelopmentSeedInput {
  clientName: string;
  clientEmail: string;
  adminFullName: string;
  adminEmail: string;
  adminPassword: string;
}

export async function seedDevelopmentData(input: DevelopmentSeedInput) {
  const values = Object.values(input);

  if (values.some((value) => value.trim().length === 0)) {
    throw new Error("Todos os dados de desenvolvimento são obrigatórios.");
  }

  const password = await bcrypt.hash(input.adminPassword, 10);

  return prisma.$transaction(async (tx) => {
    const client = await tx.client.upsert({
      where: { email: input.clientEmail },
      update: { name: input.clientName },
      create: {
        name: input.clientName,
        email: input.clientEmail,
      },
    });

    const role = await tx.role.upsert({
      where: { code: Role.ADMIN },
      update: {
        name: "Administrador",
        description:
          "CEO ou administrador global do cliente, com acesso a todos os seus lares.",
        isSystem: true,
        clientId: null,
      },
      create: {
        code: Role.ADMIN,
        name: "Administrador",
        description:
          "CEO ou administrador global do cliente, com acesso a todos os seus lares.",
        isSystem: true,
        clientId: null,
      },
    });

    await validateUserScope(tx, {
      clientId: client.id,
      facilityId: null,
      roleId: role.id,
    });

    return tx.user.upsert({
      where: { email: input.adminEmail },
      update: {
        clientId: client.id,
        facilityId: null,
        roleId: role.id,
        fullName: input.adminFullName,
        password,
        active: true,
      },
      create: {
        clientId: client.id,
        roleId: role.id,
        fullName: input.adminFullName,
        email: input.adminEmail,
        password,
        active: true,
      },
    });
  });
}
