import { seedPermissions } from "./seeds/permissions.seed";
import { seedRolePermissions } from "./seeds/rolePermissions.seed";
import { seedRoles } from "./seeds/roles.seed";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$transaction(
    async (tx) => {
      await seedRoles(tx);
      await seedPermissions(tx);
      await seedRolePermissions(tx);
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
