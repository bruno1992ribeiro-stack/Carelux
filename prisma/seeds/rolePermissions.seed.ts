import type { Prisma } from "@prisma/client";

import { Permission } from "../../src/modules/authorization/permissions";
import { Role } from "../../src/modules/authorization/roles";

const allPermissions = Object.values(Permission);

const adminPermissions: readonly Permission[] = [
  Permission.VIEW_RESIDENT,
  Permission.CREATE_RESIDENT,
  Permission.EDIT_RESIDENT,
  Permission.ARCHIVE_RESIDENT,
  Permission.RESTORE_RESIDENT,
  Permission.VIEW_CLINICAL_RECORD,
  Permission.EDIT_CLINICAL_RECORD,
  Permission.EDIT_PATHOLOGY,
  Permission.EDIT_ALLERGY,
  Permission.VIEW_MEDICATION,
  Permission.EDIT_MEDICATION,
  Permission.VIEW_APPOINTMENT,
  Permission.EDIT_APPOINTMENT,
  Permission.VIEW_DOCUMENT,
  Permission.CREATE_DOCUMENT,
  Permission.DELETE_DOCUMENT,
  Permission.DOWNLOAD_DOCUMENT,
  Permission.PRINT_DOCUMENT,
  Permission.VIEW_EMPLOYEES,
  Permission.EDIT_EMPLOYEES,
  Permission.VIEW_FINANCE,
  Permission.EDIT_FINANCE,
  Permission.VIEW_INVENTORY,
  Permission.EDIT_INVENTORY,
  Permission.CREATE_INVENTORY_REQUEST,
  Permission.PROCESS_INVENTORY_REQUEST,
  Permission.MANAGE_USERS,
  Permission.VIEW_AUDIT,
  Permission.EXPORT_DATA,
  Permission.VIEW_FAMILY,
  Permission.SEND_MESSAGES,
];

export const rolePermissionMatrix: Record<Role, readonly Permission[]> = {
  [Role.SUPER_ADMIN]: allPermissions,
  [Role.ADMIN]: adminPermissions,
  [Role.FACILITY_ADMIN]: [
    Permission.VIEW_RESIDENT,
    Permission.CREATE_RESIDENT,
    Permission.EDIT_RESIDENT,
    Permission.ARCHIVE_RESIDENT,
    Permission.RESTORE_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.EDIT_PATHOLOGY,
    Permission.EDIT_ALLERGY,
    Permission.VIEW_MEDICATION,
    Permission.EDIT_MEDICATION,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
    Permission.VIEW_EMPLOYEES,
    Permission.EDIT_EMPLOYEES,
    Permission.VIEW_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.CREATE_INVENTORY_REQUEST,
    Permission.PROCESS_INVENTORY_REQUEST,
  ],
  [Role.WAREHOUSE_MANAGER]: [
    Permission.VIEW_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.PROCESS_INVENTORY_REQUEST,
  ],
  [Role.DIRECTOR]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.VIEW_MEDICATION,
    Permission.VIEW_APPOINTMENT,
    Permission.VIEW_EMPLOYEES,
  ],
  [Role.DOCTOR]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.EDIT_PATHOLOGY,
    Permission.EDIT_ALLERGY,
    Permission.VIEW_MEDICATION,
    Permission.EDIT_MEDICATION,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.NURSE]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.EDIT_PATHOLOGY,
    Permission.EDIT_ALLERGY,
    Permission.VIEW_MEDICATION,
    Permission.EDIT_MEDICATION,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.PHYSIOTHERAPIST]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.OCCUPATIONAL_THERAPIST]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.SPEECH_THERAPIST]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.PSYCHOLOGIST]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.NUTRITIONIST]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.SOCIAL_WORKER]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_CLINICAL_RECORD,
    Permission.EDIT_CLINICAL_RECORD,
    Permission.VIEW_APPOINTMENT,
  ],
  [Role.CAREGIVER]: [
    Permission.VIEW_RESIDENT,
    Permission.CREATE_INVENTORY_REQUEST,
  ],
  [Role.RECEPTIONIST]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_APPOINTMENT,
    Permission.EDIT_APPOINTMENT,
  ],
  [Role.ADMINISTRATIVE]: [
    Permission.VIEW_RESIDENT,
    Permission.VIEW_FINANCE,
  ],
  [Role.FAMILY]: [Permission.VIEW_FAMILY, Permission.SEND_MESSAGES],
  [Role.EXTERNAL_AUDITOR]: [Permission.VIEW_AUDIT],
};

export async function seedRolePermissions(client: Prisma.TransactionClient) {
  const roles = await client.role.findMany({
    where: { code: { in: Object.values(Role) } },
    select: { id: true, code: true },
  });
  const permissions = await client.permission.findMany({
    where: { code: { in: allPermissions } },
    select: { id: true, code: true },
  });

  const rolesByCode = new Map(roles.map((role) => [role.code, role.id]));
  const permissionsByCode = new Map(
    permissions.map((permission) => [permission.code, permission.id]),
  );

  for (const role of Object.values(Role)) {
    const roleId = rolesByCode.get(role);

    if (!roleId) {
      throw new Error(`Role canónica não encontrada: ${role}`);
    }

    for (const permission of rolePermissionMatrix[role]) {
      const permissionId = permissionsByCode.get(permission);

      if (!permissionId) {
        throw new Error(`Permissão canónica não encontrada: ${permission}`);
      }

      await client.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }

  }

  console.log("Permissões das Roles sincronizadas.");
}
