import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  type Permission,
} from "@/shared/utils/permissions";

describe("hasPermission", () => {
  it("returns true when user has the required permission", () => {
    const perms: Permission[] = ["users:view", "roles:view"];
    expect(hasPermission(perms, "users:view")).toBe(true);
  });

  it("returns false when user lacks the required permission", () => {
    const perms: Permission[] = ["users:view"];
    expect(hasPermission(perms, "users:update")).toBe(false);
  });

  it("returns false when permissions array is undefined", () => {
    expect(hasPermission(undefined, "users:view")).toBe(false);
  });

  it("returns false when permissions array is empty", () => {
    expect(hasPermission([], "users:view")).toBe(false);
  });

  it("returns true for admin:panel_access when present", () => {
    expect(
      hasPermission(
        ["admin:panel_access"] as Permission[],
        "admin:panel_access",
      ),
    ).toBe(true);
  });
});

describe("hasAnyPermission", () => {
  it("returns true when user has at least one required permission", () => {
    const perms: Permission[] = ["users:view"];
    expect(hasAnyPermission(perms, ["users:view", "users:update"])).toBe(true);
  });

  it("returns false when user has none of the required permissions", () => {
    const perms: Permission[] = ["roles:view"];
    expect(hasAnyPermission(perms, ["users:view", "users:update"])).toBe(false);
  });

  it("returns false when user permissions are undefined", () => {
    expect(hasAnyPermission(undefined, ["users:view"])).toBe(false);
  });

  it("returns false when required permissions list is empty", () => {
    const perms: Permission[] = ["users:view"];
    expect(hasAnyPermission(perms, [])).toBe(false);
  });

  it("returns true when user has all required permissions listed", () => {
    const perms: Permission[] = ["users:view", "users:update", "users:delete"];
    expect(hasAnyPermission(perms, ["users:update"])).toBe(true);
  });
});
