import { getRoleOptions } from "@/features/auth/roles";
import type { AuthRoleConfig, UserRole } from "@/types/auth";
import { roleCatalog } from "@/features/auth/roles";

export function getRoles(): AuthRoleConfig[] {
  return getRoleOptions();
}

export function getRoleById(roleId: UserRole): AuthRoleConfig {
  return roleCatalog[roleId];
}
