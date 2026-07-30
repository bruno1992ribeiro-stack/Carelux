import { prisma } from "../../src/lib/prisma";

export async function seedRolePermissions() {
  // SUPER_ADMIN recebe todas as permissões

  const superAdmin = await prisma.role.findUnique({
    where: {
      code: "SUPER_ADMIN",
    },
  });

  if (!superAdmin) {
    throw new Error("SUPER_ADMIN role not found");
  }

  const permissions = await prisma.permission.findMany();

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdmin.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdmin.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✅ Super Admin permissions seeded");
}