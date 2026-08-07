import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

import { validateUserScope } from "../src/lib/user-scope";

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // Procurar ou criar Client
  const client = await prisma.client.upsert({
    where: {
      email: "admin@carelux.pt",
    },
    update: {},
    create: {
      name: "CareLux",
      email: "admin@carelux.pt",
    },
  });

  // Procurar ou criar Role
  const role = await prisma.role.upsert({
    where: {
      code: "ADMIN",
    },
    update: {},
    create: {
      code: "ADMIN",
      name: "Administrador",
      isSystem: true,
      clientId: null,
    },
  });

  await validateUserScope(prisma, {
    clientId: client.id,
    facilityId: null,
    roleId: role.id,
  });

  // Procurar ou criar User
  await prisma.user.upsert({
    where: {
      email: "admin@carelux.pt",
    },
    update: {
      password,
      clientId: client.id,
      facilityId: null,
      roleId: role.id,
    },
    create: {
      fullName: "Administrador",
      email: "admin@carelux.pt",
      password,
      clientId: client.id,
      roleId: role.id,
    },
  });

  console.log("✅ Administrador criado!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
