import { describe, expect, it } from "vitest";
import {
  filterAuthorizedNavigationItems,
  resolveAuthorizedRoute,
  resolvePostLoginRoute,
} from "@/shared/lib/authz-routing";
import {
  ADMIN_NAV_ITEMS,
  APP_ROUTES,
  PROFILE_NAV_ITEMS,
} from "@/shared/lib/routes";

describe("authz routing", () => {
  it("filters navigation items with the shared permission policy", () => {
    const items = filterAuthorizedNavigationItems(ADMIN_NAV_ITEMS, [
      "users.list",
      "roles.list",
    ]);

    expect(items.map((item) => item.href)).toEqual([
      APP_ROUTES.users,
      APP_ROUTES.roles,
    ]);
  });

  it("resolves the first authorized route using nav order", () => {
    expect(resolveAuthorizedRoute(["roles.list"])).toBe(APP_ROUTES.roles);
    expect(resolveAuthorizedRoute(["profile.read.self"], PROFILE_NAV_ITEMS)).toBe(
      APP_ROUTES.profile,
    );
  });

  it("falls back to forbidden when no page is accessible", () => {
    expect(resolveAuthorizedRoute([])).toBe(APP_ROUTES.dashboard);
  });

  it("derives the post-login route from the resolved authz snapshot", () => {
    expect(
      resolvePostLoginRoute({
        permissions: ["notifications.list", "profile.read.self"],
        state: "resolved",
        source: "user.permissions",
        user: {
          id: "user-1",
          email: "admin@example.com",
          surface: "admin",
          role: {
            id: "role-1",
            name: "support",
            is_system: false,
          },
          avatar_url: null,
          full_name: null,
          username: null,
          permissions: ["notifications.list", "profile.read.self"],
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        },
      }),
    ).toBe(APP_ROUTES.notifications);
  });
});
