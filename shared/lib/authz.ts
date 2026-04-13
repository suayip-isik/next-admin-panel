import { apiClient } from "@/lib/api-client";
import { AppError, unwrapApiResult } from "@/lib/errors";
import type { Permission } from "@/shared/utils/permissions";
import type { components } from "@/types/api.generated";

export const AUTHZ_SNAPSHOT_QUERY_KEY = ["authz", "snapshot"] as const;
export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

export type CurrentUser = components["schemas"]["UserResponse"] & {
  permissions?: Permission[];
  role:
    | components["schemas"]["RoleResponse"]
    | components["schemas"]["RoleInfo"];
};

export type PermissionResolutionSource =
  | "user.permissions"
  | "role.permissions"
  | "role-detail"
  | "unavailable";

export type PermissionResolutionState = "resolved" | "unavailable";

export interface AuthzSnapshot {
  user: CurrentUser;
  permissions: Permission[];
  state: PermissionResolutionState;
  source: PermissionResolutionSource;
}

export function normalizePermissions(value: unknown): Permission[] {
  return Array.isArray(value) ? (value as Permission[]) : [];
}

function getRoleRecord(
  user: CurrentUser | Record<string, unknown>,
): Record<string, unknown> | undefined {
  const role = "role" in user ? user.role : undefined;
  return role && typeof role === "object"
    ? (role as Record<string, unknown>)
    : undefined;
}

export function getTopLevelPermissions(
  user: CurrentUser | Record<string, unknown>,
): Permission[] {
  return normalizePermissions(
    "permissions" in user ? user.permissions : undefined,
  );
}

export function getRolePermissions(
  user: CurrentUser | Record<string, unknown>,
): Permission[] {
  return normalizePermissions(getRoleRecord(user)?.permissions);
}

export function getCurrentRoleId(
  user: CurrentUser | Record<string, unknown>,
): string | null {
  const roleId = getRoleRecord(user)?.id;
  return typeof roleId === "string" && roleId.length > 0 ? roleId : null;
}

export function hasPermissionMetadata(
  user: CurrentUser | Record<string, unknown> | undefined,
): boolean {
  if (!user) return false;
  return (
    getTopLevelPermissions(user).length > 0 ||
    getRolePermissions(user).length > 0
  );
}

export function createResolvedSnapshot(
  user: CurrentUser,
  permissions: Permission[],
  source: Exclude<PermissionResolutionSource, "unavailable">,
): AuthzSnapshot {
  return {
    user,
    permissions,
    state: "resolved",
    source,
  };
}

export function createUnavailableSnapshot(user: CurrentUser): AuthzSnapshot {
  return {
    user,
    permissions: [],
    state: "unavailable",
    source: "unavailable",
  };
}

export function resolvePermissionsFromUser(user: CurrentUser): {
  snapshot: AuthzSnapshot | null;
  roleId: string | null;
} {
  const topLevelPermissions = getTopLevelPermissions(user);
  if (topLevelPermissions.length > 0) {
    return {
      snapshot: createResolvedSnapshot(
        user,
        topLevelPermissions,
        "user.permissions",
      ),
      roleId: null,
    };
  }

  const rolePermissions = getRolePermissions(user);
  if (rolePermissions.length > 0) {
    return {
      snapshot: createResolvedSnapshot(
        user,
        rolePermissions,
        "role.permissions",
      ),
      roleId: null,
    };
  }

  return {
    snapshot: null,
    roleId: getCurrentRoleId(user),
  };
}

async function fetchRoleDetail(roleId: string) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/roles/{role_id}", {
      params: { path: { role_id: roleId } },
    }),
  );
}

export async function resolveClientAuthzSnapshot(): Promise<AuthzSnapshot> {
  const user = unwrapApiResult<CurrentUser>(
    await apiClient.GET("/api/v1/shared/me"),
  );
  const resolved = resolvePermissionsFromUser(user);

  if (resolved.snapshot) {
    return resolved.snapshot;
  }

  if (!resolved.roleId) {
    return createUnavailableSnapshot(user);
  }

  try {
    const role = await fetchRoleDetail(resolved.roleId);
    const permissions = normalizePermissions(role.permissions);

    return createResolvedSnapshot(
      { ...user, role },
      permissions,
      "role-detail",
    );
  } catch (error) {
    if (error instanceof AppError && [403, 404].includes(error.status)) {
      return createUnavailableSnapshot(user);
    }

    throw error;
  }
}
