import type { Permission, PermissionCheck } from "@/shared/utils/permissions";

export interface RouteAccessConfig extends PermissionCheck {
  adminSurface?: boolean;
}

export const PAGE_ACCESS = {
  dashboard: {
    adminSurface: true,
    any: ["users.read.stats"] satisfies Permission[],
  },
  usersList: {
    adminSurface: true,
    all: ["users.list"] satisfies Permission[],
  },
  usersDeleted: {
    adminSurface: true,
    all: ["users.read.deleted"] satisfies Permission[],
  },
  userDetail: {
    adminSurface: true,
    all: ["users.read.basic"] satisfies Permission[],
  },
  rolesList: {
    adminSurface: true,
    all: ["roles.list"] satisfies Permission[],
  },
  roleDetail: {
    adminSurface: true,
    all: ["roles.read.detail"] satisfies Permission[],
  },
  auditLogs: {
    adminSurface: true,
    all: ["audit_logs.list"] satisfies Permission[],
  },
  apiKeys: {
    adminSurface: true,
    all: ["api_keys.list"] satisfies Permission[],
  },
  notifications: {
    adminSurface: true,
    all: ["notifications.list"] satisfies Permission[],
  },
  profile: {
    adminSurface: true,
    all: ["profile.read.self"] satisfies Permission[],
  },
  profileSecurity: {
    adminSurface: true,
    all: ["profile.read.self"] satisfies Permission[],
  },
} satisfies Record<string, RouteAccessConfig>;

export const ADMIN_SURFACE_PERMISSIONS: Permission[] = [
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
] as const;
