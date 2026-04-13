import type { AuthzSnapshot } from "@/shared/lib/authz";
import {
  APP_ROUTES,
  ADMIN_NAV_ITEMS,
  PROFILE_NAV_ITEMS,
  type NavigationItem,
} from "@/shared/lib/routes";
import {
  matchesPermissionCheck,
  type Permission,
} from "@/shared/utils/permissions";

const POST_LOGIN_NAV_ITEMS: readonly NavigationItem[] = [
  ...ADMIN_NAV_ITEMS,
  ...PROFILE_NAV_ITEMS,
];

export function filterAuthorizedNavigationItems(
  items: readonly NavigationItem[],
  permissions: Permission[],
) {
  return items.filter((item) =>
    matchesPermissionCheck(permissions, item.access),
  );
}

export function resolveAuthorizedRoute(
  permissions: Permission[],
  items: readonly NavigationItem[] = POST_LOGIN_NAV_ITEMS,
) {
  return (
    filterAuthorizedNavigationItems(items, permissions)[0]?.href ??
    APP_ROUTES.dashboard
  );
}

export function resolvePostLoginRoute(snapshot: AuthzSnapshot) {
  return resolveAuthorizedRoute(snapshot.permissions);
}
