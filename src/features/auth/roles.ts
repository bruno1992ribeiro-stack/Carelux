import { Role } from "@/modules/authorization/roles";
import type { AuthRoleConfig } from "@/types/auth";

export const roleCatalog: Record<string, AuthRoleConfig> = {
  administrator: {
    id: "administrator",
    label: "Administrador",
    description: "Gestão completa da plataforma CareLux.",
    accent: "emerald",
    badge: Role.ADMIN,
  },

  employee: {
    id: "employee",
    label: "Colaborador",
    description: "Prestação de cuidados e tarefas diárias.",
    accent: "blue",
    badge: "STAFF",
  },

  family: {
    id: "family",
    label: "Familiar",
    description: "Consulta de informação do utente.",
    accent: "amber",
    badge: Role.FAMILY,
  },
};

export function getRoleOptions(): AuthRoleConfig[] {
  return Object.values(roleCatalog);
}
