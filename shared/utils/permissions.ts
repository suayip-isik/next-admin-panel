import type { components } from "@/types/api.generated";

export type Permission = components["schemas"]["Permission"];

export const PERMISSIONS: Permission[] = [
  "profile.read.self",
  "profile.update.basic",
  "profile.update.email",
  "profile.update.password",
  "profile.update.avatar",
  "profile.delete.avatar",
  "uploads.create.own",
  "uploads.delete.own",
  "uploads.delete.any",
  "users.list",
  "users.read.basic",
  "users.read.deleted",
  "users.read.stats",
  "users.create.admin",
  "users.update.profile",
  "users.update.email",
  "users.update.role",
  "users.update.avatar",
  "users.delete.avatar",
  "users.resend.verification",
  "users.resend.admin_invite",
  "users.activate",
  "users.deactivate",
  "users.delete",
  "users.restore",
  "roles.list",
  "roles.read.detail",
  "roles.create",
  "roles.update.description",
  "roles.update.permissions",
  "roles.delete",
  "audit_logs.list",
  "audit_logs.read.detail",
  "audit_logs.stream",
  "api_keys.list",
  "api_keys.create",
  "api_keys.revoke",
  "notifications.list",
  "notifications.read.unread_count",
  "notifications.update.read",
  "notifications.update.all_read",
  "notifications.delete",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "profile.read.self": "Read Own Profile",
  "profile.update.basic": "Update Own Basic Profile",
  "profile.update.email": "Update Own Email",
  "profile.update.password": "Update Own Password",
  "profile.update.avatar": "Upload Own Avatar",
  "profile.delete.avatar": "Delete Own Avatar",
  "uploads.create.own": "Create Own Uploads",
  "uploads.delete.own": "Delete Own Uploads",
  "uploads.delete.any": "Delete Any Upload",
  "users.list": "List Users",
  "users.read.basic": "Read User Detail",
  "users.read.deleted": "Read Deleted Users",
  "users.read.stats": "Read User Stats",
  "users.create.admin": "Create Admin User",
  "users.update.profile": "Update User Profile",
  "users.update.email": "Update User Email",
  "users.update.role": "Update User Role",
  "users.update.avatar": "Upload User Avatar",
  "users.delete.avatar": "Delete User Avatar",
  "users.resend.verification": "Resend Verification",
  "users.resend.admin_invite": "Resend Admin Invite",
  "users.activate": "Activate User",
  "users.deactivate": "Deactivate User",
  "users.delete": "Delete User",
  "users.restore": "Restore User",
  "roles.list": "List Roles",
  "roles.read.detail": "Read Role Detail",
  "roles.create": "Create Role",
  "roles.update.description": "Update Role Description",
  "roles.update.permissions": "Replace Role Permissions",
  "roles.delete": "Delete Role",
  "audit_logs.list": "List Audit Logs",
  "audit_logs.read.detail": "Read Audit Log Detail",
  "audit_logs.stream": "Stream Audit Logs",
  "api_keys.list": "List API Keys",
  "api_keys.create": "Create API Keys",
  "api_keys.revoke": "Revoke API Keys",
  "notifications.list": "List Notifications",
  "notifications.read.unread_count": "Read Notification Unread Count",
  "notifications.update.read": "Mark Notification Read",
  "notifications.update.all_read": "Mark All Notifications Read",
  "notifications.delete": "Delete Notifications",
};

export interface PermissionCheck {
  all?: Permission[];
  any?: Permission[];
}

function coercePermissionList(value: unknown): Permission[] {
  return Array.isArray(value) ? (value as Permission[]) : [];
}

export function hasPermissionMetadata(
  user: Record<string, unknown> | undefined,
): boolean {
  if (!user) {
    return false;
  }

  if (Array.isArray(user.permissions)) {
    return true;
  }

  const role =
    user.role && typeof user.role === "object"
      ? (user.role as Record<string, unknown>)
      : undefined;

  return Array.isArray(role?.permissions);
}

export function getPermissionsFromRole(
  role: Record<string, unknown> | undefined,
): Permission[] {
  return coercePermissionList(role?.permissions);
}

export function getPermissionsFromUser(
  user: Record<string, unknown> | undefined,
): Permission[] {
  const topLevelPermissions = coercePermissionList(user?.permissions);
  if (topLevelPermissions.length > 0) {
    return topLevelPermissions;
  }

  const role =
    user?.role && typeof user.role === "object"
      ? (user.role as Record<string, unknown>)
      : undefined;

  return getPermissionsFromRole(role);
}

export function hasPermission(
  userPermissions: Permission[] | undefined,
  required: Permission,
): boolean {
  return userPermissions?.includes(required) ?? false;
}

export function hasAllPermissions(
  userPermissions: Permission[] | undefined,
  required: Permission[],
): boolean {
  if (!required.length) return false;
  return required.every((permission) =>
    hasPermission(userPermissions, permission),
  );
}

export function hasAnyPermission(
  userPermissions: Permission[] | undefined,
  required: Permission[],
): boolean {
  if (!required.length) return false;
  return required.some((p) => hasPermission(userPermissions, p));
}

export function matchesPermissionCheck(
  userPermissions: Permission[] | undefined,
  check?: PermissionCheck,
): boolean {
  if (!check) return true;
  const matchesAll = check.all
    ? hasAllPermissions(userPermissions, check.all)
    : true;
  const matchesAny = check.any
    ? hasAnyPermission(userPermissions, check.any)
    : true;
  return matchesAll && matchesAny;
}
