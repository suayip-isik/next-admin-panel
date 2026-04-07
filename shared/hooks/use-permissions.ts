"use client";

import { useCurrentUser } from "@/shared/hooks/use-session-meta";
import type { Permission } from "@/shared/utils/permissions";
import { hasPermission, hasAnyPermission } from "@/shared/utils/permissions";

export { useCurrentUser };

export function useHasPermission(permission: Permission): boolean {
  const { data } = useCurrentUser();
  const perms = (data?.role as { permissions?: string[] } | undefined)
    ?.permissions as Permission[] | undefined;
  return hasPermission(perms, permission);
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { data } = useCurrentUser();
  const perms = (data?.role as { permissions?: string[] } | undefined)
    ?.permissions as Permission[] | undefined;
  return hasAnyPermission(perms, permissions);
}
