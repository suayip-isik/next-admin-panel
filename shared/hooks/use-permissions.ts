"use client";

import {
  useAuthzSnapshot,
  useCurrentUser,
} from "@/shared/hooks/use-session-meta";
import type { Permission, PermissionCheck } from "@/shared/utils/permissions";
import { matchesPermissionCheck } from "@/shared/utils/permissions";

export { useCurrentUser };

export type PermissionGateStatus =
  | "loading"
  | "allowed"
  | "denied"
  | "unavailable";

export interface PermissionGateResult {
  isAllowed: boolean;
  isLoading: boolean;
  status: PermissionGateStatus;
}

export function useHasPermission(permission: Permission): boolean {
  const gate = usePermissionGate({ all: [permission] });
  return gate.status === "allowed";
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  const gate = usePermissionGate({ any: permissions });
  return gate.status === "allowed";
}

export function useHasAllPermissions(permissions: Permission[]): boolean {
  const gate = usePermissionGate({ all: permissions });
  return gate.status === "allowed";
}

export function usePermissionAccess(check?: PermissionCheck): boolean {
  const gate = usePermissionGate(check);
  return gate.status === "allowed";
}

export function usePermissionGate(
  check?: PermissionCheck,
): PermissionGateResult {
  const { data, isLoading, isFetching } = useAuthzSnapshot();

  if (isLoading || isFetching || !data) {
    return {
      isAllowed: false,
      isLoading: true,
      status: "loading",
    };
  }

  if (data.state !== "resolved") {
    return {
      isAllowed: false,
      isLoading: false,
      status: "unavailable",
    };
  }

  return {
    isAllowed: matchesPermissionCheck(data.permissions, check),
    isLoading: false,
    status: matchesPermissionCheck(data.permissions, check)
      ? "allowed"
      : "denied",
  };
}
