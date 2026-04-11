import type { components } from "@/types/api.generated";

export type Permission = components["schemas"]["Permission"];

export const PERMISSIONS: Permission[] = [
  "admin:panel_access",
  "users:list",
  "users:view",
  "users:view_stats",
  "users:list_deleted",
  "users:create_admin",
  "users:update",
  "users:upload_avatar",
  "users:delete_avatar",
  "users:change_email",
  "users:resend_verification",
  "users:resend_admin_invite",
  "users:activate",
  "users:deactivate",
  "users:assign_role",
  "users:delete",
  "users:restore",
  "roles:list",
  "roles:view",
  "roles:create",
  "roles:update",
  "roles:delete",
  "audit:list",
  "audit:stream",
  "audit:view",
  "api_keys:list",
  "api_keys:create",
  "api_keys:revoke",
  "notifications:list",
  "notifications:view_unread_count",
  "notifications:mark_all_read",
  "notifications:mark_read",
  "notifications:delete",
  "profile:view",
  "profile:update",
  "profile:upload_avatar",
  "profile:delete_avatar",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "admin:panel_access": "Admin Panel Access",
  "users:list": "List Users",
  "users:view": "View User Details",
  "users:view_stats": "View User Stats",
  "users:list_deleted": "List Deleted Users",
  "users:create_admin": "Create Admin Users",
  "users:update": "Update Users",
  "users:upload_avatar": "Upload User Avatar",
  "users:delete_avatar": "Delete User Avatar",
  "users:change_email": "Change User Email",
  "users:resend_verification": "Resend Verification",
  "users:resend_admin_invite": "Resend Admin Invite",
  "users:activate": "Activate Users",
  "users:deactivate": "Deactivate Users",
  "users:assign_role": "Assign User Role",
  "users:delete": "Delete Users",
  "users:restore": "Restore Users",
  "roles:list": "List Roles",
  "roles:view": "View Roles",
  "roles:create": "Create Roles",
  "roles:update": "Update Roles",
  "roles:delete": "Delete Roles",
  "audit:list": "List Audit Logs",
  "audit:stream": "Stream Audit Logs",
  "audit:view": "View Audit Log Details",
  "api_keys:list": "List API Keys",
  "api_keys:create": "Create API Keys",
  "api_keys:revoke": "Revoke API Keys",
  "notifications:list": "List Notifications",
  "notifications:view_unread_count": "View Unread Counts",
  "notifications:mark_all_read": "Mark All Notifications Read",
  "notifications:mark_read": "Mark Notifications Read",
  "notifications:delete": "Delete Notifications",
  "profile:view": "View Profile",
  "profile:update": "Update Profile",
  "profile:upload_avatar": "Upload Profile Avatar",
  "profile:delete_avatar": "Delete Profile Avatar",
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
