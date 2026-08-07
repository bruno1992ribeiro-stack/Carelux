import { AppError } from "@/lib/errors/app-error";
import { isGlobalSuperAdmin } from "@/lib/user-scope";
import { Permission } from "@/modules/authorization/permissions";
import { Role } from "@/modules/authorization/roles";

type UserWithPermissions =
  | {
      clientId: string | null;
      facilityId: string | null;
      role?: {
        code: string;
        clientId: string | null;
        permissions?: Array<{
          permission: {
            code: string;
          };
        }>;
      } | null;
    }
  | null
  | undefined;

const permissionCodes = new Set<string>(Object.values(Permission));

export function getUserPermissionCodes(
  user: UserWithPermissions,
): Permission[] {
  if (!user?.role) {
    return [];
  }

  if (user.role.code === Role.SUPER_ADMIN) {
    if (!isGlobalSuperAdmin(user)) {
      return [];
    }
  } else if (
    user.clientId === null ||
    (user.role.clientId !== null && user.role.clientId !== user.clientId)
  ) {
    return [];
  }

  const codes = user.role.permissions
    ?.map(({ permission }) => permission.code)
    .filter((code): code is Permission => permissionCodes.has(code));

  return [...new Set(codes ?? [])];
}

export function hasPermission(
  user: UserWithPermissions,
  permission: Permission,
): boolean {
  return getUserPermissionCodes(user).includes(permission);
}

export function hasAnyPermission(
  user: UserWithPermissions,
  permissions: readonly Permission[],
): boolean {
  const userPermissions = new Set(getUserPermissionCodes(user));

  return permissions.some((permission) => userPermissions.has(permission));
}

export function requirePermission(
  user: UserWithPermissions,
  permission: Permission,
): void {
  if (!user) {
    throw new AppError(
      "UNAUTHENTICATED",
      "A sessão terminou. Inicie sessão novamente.",
      401,
    );
  }

  if (!hasPermission(user, permission)) {
    throw new AppError(
      "FORBIDDEN",
      "Não tem permissão para executar esta operação.",
      403,
    );
  }
}
