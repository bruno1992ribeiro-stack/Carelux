import type { AuthRoleConfig, UserRole } from "@/types/auth";

export const roleCatalog: Record<UserRole, AuthRoleConfig> = {
  administrator: {
    id: "administrator",
    label: "Administrator",
    description: "Full oversight across care operations and staff.",
    accent: "from-emerald-500/15 to-teal-500/10",
    badge: "Admin",
  },
  employee: {
    id: "employee",
    label: "Employee",
    description: "Daily coordination and resident care support.",
    accent: "from-sky-500/15 to-cyan-500/10",
    badge: "Staff",
  },
  family: {
    id: "family",
    label: "Family",
    description: "Trusted visibility into care updates and milestones.",
    accent: "from-violet-500/15 to-fuchsia-500/10",
    badge: "Family",
  },
};

export function getRoleOptions() {
  return Object.values(roleCatalog);
}
