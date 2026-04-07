import type { components } from "@/types/api.generated";

export type Permission = components["schemas"]["Permission"];

export const PERMISSIONS: Permission[] = [
  "admin:access",
  "users:read",
  "users:write",
  "users:delete",
  "roles:read",
  "roles:write",
  "audit:read",
  "api_keys:read",
  "api_keys:write",
  "notifications:read",
  "profile:read",
  "profile:write",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "admin:access": "Admin Access",
  "users:read": "View Users",
  "users:write": "Edit Users",
  "users:delete": "Delete Users",
  "roles:read": "View Roles",
  "roles:write": "Edit Roles",
  "audit:read": "View Audit Logs",
  "api_keys:read": "View API Keys",
  "api_keys:write": "Manage API Keys",
  "notifications:read": "View Notifications",
  "profile:read": "View Profile",
  "profile:write": "Edit Profile",
};

export function hasPermission(
  userPermissions: Permission[] | undefined,
  required: Permission,
): boolean {
  return userPermissions?.includes(required) ?? false;
}

export function hasAnyPermission(
  userPermissions: Permission[] | undefined,
  required: Permission[],
): boolean {
  return required.some((p) => hasPermission(userPermissions, p));
}
