"use client";

import { useCurrentUser } from "@/shared/hooks/use-session-meta";
import type { Permission } from "@/shared/utils/permissions";
import { hasPermission, hasAnyPermission } from "@/shared/utils/permissions";

export { useCurrentUser };

function getRolePermissions(role: Record<string, unknown> | undefined) {
  const permissions = role?.permissions;
  return Array.isArray(permissions) ? (permissions as Permission[]) : undefined;
}

export function useHasPermission(permission: Permission): boolean {
  const { data } = useCurrentUser();
  const permissions = getRolePermissions(data?.role);
  return hasPermission(permissions, permission);
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { data } = useCurrentUser();
  const currentPermissions = getRolePermissions(data?.role);
  return hasAnyPermission(currentPermissions, permissions);
}
