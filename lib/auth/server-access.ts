import { forbidden, redirect } from "next/navigation";
import { APP_ROUTES } from "@/shared/lib/routes";
import {
  ADMIN_SURFACE_PERMISSIONS,
  PAGE_ACCESS,
} from "@/shared/lib/authz-policy";
import {
  createResolvedSnapshot,
  createUnavailableSnapshot,
  getCurrentRoleId,
  normalizePermissions,
  resolvePermissionsFromUser,
  type AuthzSnapshot,
  type CurrentUser,
} from "@/shared/lib/authz";
import {
  hasAnyPermission,
  matchesPermissionCheck,
  type PermissionCheck,
} from "@/shared/utils/permissions";
import type { components } from "@/types/api.generated";
import { getAccessTokenFromCookies } from "@/lib/auth/cookies";
import { forwardToFastApi } from "@/lib/auth/fastapi";

export async function getServerCurrentUser(): Promise<CurrentUser | null> {
  const accessToken = await getAccessTokenFromCookies();

  if (!accessToken) {
    return null;
  }

  const response = await forwardToFastApi("/api/v1/shared/me", {
    method: "GET",
    accessToken,
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`);
  }

  return (await response.json()) as CurrentUser;
}

async function fetchRoleDetailForCurrentUser(
  accessToken: string,
  roleId: string,
): Promise<components["schemas"]["RoleResponse"] | null> {
  const response = await forwardToFastApi(`/api/v1/admin/roles/${roleId}`, {
    method: "GET",
    accessToken,
  });

  if (!response.ok) {
    if ([403, 404].includes(response.status)) {
      return null;
    }

    throw new Error(`Failed to fetch role detail: ${response.status}`);
  }

  return (await response.json()) as components["schemas"]["RoleResponse"];
}

export async function resolveServerAuthzSnapshot(): Promise<AuthzSnapshot | null> {
  const accessToken = await getAccessTokenFromCookies();

  if (!accessToken) {
    return null;
  }

  const currentUser = await getServerCurrentUser();

  if (!currentUser) {
    return null;
  }

  const immediate = resolvePermissionsFromUser(currentUser);
  if (immediate.snapshot) {
    return immediate.snapshot;
  }

  const roleId = immediate.roleId ?? getCurrentRoleId(currentUser);
  if (!roleId) {
    return createUnavailableSnapshot(currentUser);
  }

  const role = await fetchRoleDetailForCurrentUser(accessToken, roleId);
  if (!role) {
    return createUnavailableSnapshot(currentUser);
  }

  return createResolvedSnapshot(
    { ...currentUser, role },
    normalizePermissions(role.permissions),
    "role-detail",
  );
}

export async function requireAuthenticatedUser() {
  const snapshot = await resolveServerAuthzSnapshot();

  if (!snapshot) {
    redirect(APP_ROUTES.login);
  }

  return snapshot;
}

export async function requireAdminSurface() {
  const snapshot = await requireAuthenticatedUser();
  const { user, permissions } = snapshot;
  const hasAdminPermission = hasAnyPermission(
    permissions,
    ADMIN_SURFACE_PERMISSIONS,
  );

  if (user.surface !== "admin" && !hasAdminPermission) {
    forbidden();
  }

  return snapshot;
}

export async function requirePageAccess(check: PermissionCheck) {
  const snapshot = await requireAdminSurface();

  if (
    snapshot.state !== "resolved" ||
    !matchesPermissionCheck(snapshot.permissions, check)
  ) {
    forbidden();
  }

  return snapshot;
}

export async function requireNamedPageAccess(page: keyof typeof PAGE_ACCESS) {
  const config = PAGE_ACCESS[page];
  if (config.adminSurface) {
    return requirePageAccess(config);
  }

  return requireAuthenticatedUser();
}
