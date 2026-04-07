import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  type Permission,
} from "@/shared/utils/permissions";

describe("hasPermission", () => {
  it("returns true when user has the required permission", () => {
    const perms: Permission[] = ["users:read", "roles:read"];
    expect(hasPermission(perms, "users:read")).toBe(true);
  });

  it("returns false when user lacks the required permission", () => {
    const perms: Permission[] = ["users:read"];
    expect(hasPermission(perms, "users:write")).toBe(false);
  });

  it("returns false when permissions array is undefined", () => {
    expect(hasPermission(undefined, "users:read")).toBe(false);
  });

  it("returns false when permissions array is empty", () => {
    expect(hasPermission([], "users:read")).toBe(false);
  });

  it("returns true for admin:access when present", () => {
    expect(
      hasPermission(["admin:access"] as Permission[], "admin:access"),
    ).toBe(true);
  });
});

describe("hasAnyPermission", () => {
  it("returns true when user has at least one required permission", () => {
    const perms: Permission[] = ["users:read"];
    expect(hasAnyPermission(perms, ["users:read", "users:write"])).toBe(true);
  });

  it("returns false when user has none of the required permissions", () => {
    const perms: Permission[] = ["roles:read"];
    expect(hasAnyPermission(perms, ["users:read", "users:write"])).toBe(false);
  });

  it("returns false when user permissions are undefined", () => {
    expect(hasAnyPermission(undefined, ["users:read"])).toBe(false);
  });

  it("returns false when required permissions list is empty", () => {
    const perms: Permission[] = ["users:read"];
    expect(hasAnyPermission(perms, [])).toBe(false);
  });

  it("returns true when user has all required permissions listed", () => {
    const perms: Permission[] = ["users:read", "users:write", "users:delete"];
    expect(hasAnyPermission(perms, ["users:write"])).toBe(true);
  });
});
