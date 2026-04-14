import type { PermissionCheck } from "@/shared/utils/permissions";

export const APP_ROUTES = {
  home: "/",
  login: "/login",
  totp: "/totp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  users: "/users",
  roles: "/roles",
  auditLogs: "/audit-logs",
  apiKeys: "/api-keys",
  notifications: "/notifications",
  profile: "/profile",
  profileSecurity: "/profile/security",
  unauthorized: "/unauthorized",
  forbidden: "/forbidden",
} as const;

export const AUTH_ROUTE_PATHS = [
  APP_ROUTES.login,
  APP_ROUTES.totp,
  APP_ROUTES.forgotPassword,
  APP_ROUTES.resetPassword,
] as const;

export const PUBLIC_INDEXABLE_PATHS = [
  APP_ROUTES.home,
  APP_ROUTES.login,
  APP_ROUTES.forgotPassword,
  APP_ROUTES.resetPassword,
] as const;

export const ADMIN_DISALLOWED_ROBOTS_PATHS = [
  APP_ROUTES.dashboard,
  APP_ROUTES.users,
  APP_ROUTES.roles,
  APP_ROUTES.notifications,
  APP_ROUTES.auditLogs,
  APP_ROUTES.apiKeys,
  APP_ROUTES.profile,
] as const;

export interface NavigationItem {
  key: string;
  href: string;
  access?: PermissionCheck;
}

export const ADMIN_NAV_ITEMS: NavigationItem[] = [
  {
    key: "dashboard",
    href: APP_ROUTES.dashboard,
    access: { any: ["users.read.stats"] },
  },
  {
    key: "users",
    href: APP_ROUTES.users,
    access: { all: ["users.list"] },
  },
  {
    key: "roles",
    href: APP_ROUTES.roles,
    access: { all: ["roles.list"] },
  },
  {
    key: "auditLogs",
    href: APP_ROUTES.auditLogs,
    access: { all: ["audit_logs.list"] },
  },
  {
    key: "apiKeys",
    href: APP_ROUTES.apiKeys,
    access: { all: ["api_keys.list"] },
  },
  {
    key: "notifications",
    href: APP_ROUTES.notifications,
    access: { all: ["notifications.list"] },
  },
] as const;

export const PROFILE_NAV_ITEMS: NavigationItem[] = [
  {
    key: "profile",
    href: APP_ROUTES.profile,
    access: { all: ["profile.read.self"] },
  },
  {
    key: "security",
    href: APP_ROUTES.profileSecurity,
    access: { all: ["profile.read.self"] },
  },
] as const;

export function getUserDetailRoute(userId: string) {
  return `${APP_ROUTES.users}/${userId}`;
}

export function getRoleDetailRoute(roleId: string) {
  return `${APP_ROUTES.roles}/${roleId}`;
}
