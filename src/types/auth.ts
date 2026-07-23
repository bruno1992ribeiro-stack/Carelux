export type UserRole = "administrator" | "employee" | "family";

export interface AuthRoleConfig {
  id: UserRole;
  label: string;
  description: string;
  accent: string;
  badge: string;
}
