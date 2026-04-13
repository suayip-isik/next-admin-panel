import { describe, it, expect } from "vitest";
import {
  getPermissionsFromUser,
  hasPermissionMetadata,
  hasAllPermissions,
  hasPermission,
  hasAnyPermission,
  matchesPermissionCheck,
  type Permission,
} from "@/shared/utils/permissions";

describe("hasPermission", () => {
  it("returns true when user has the required permission", () => {
    const perms: Permission[] = ["users.read.basic", "roles.read.detail"];
    expect(hasPermission(perms, "users.read.basic")).toBe(true);
  });

  it("returns false when user lacks the required permission", () => {
    const perms: Permission[] = ["users.read.basic"];
    expect(hasPermission(perms, "users.update.profile")).toBe(false);
  });

  it("returns false when permissions array is undefined", () => {
    expect(hasPermission(undefined, "users.read.basic")).toBe(false);
  });

  it("returns false when permissions array is empty", () => {
    expect(hasPermission([], "users.read.basic")).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true when user has every required permission", () => {
    const perms: Permission[] = ["users.list", "users.read.stats"];
    expect(hasAllPermissions(perms, ["users.list", "users.read.stats"])).toBe(
      true,
    );
  });

  it("returns false when any required permission is missing", () => {
    const perms: Permission[] = ["users.list"];
    expect(hasAllPermissions(perms, ["users.list", "users.read.stats"])).toBe(
      false,
    );
  });
});

describe("hasAnyPermission", () => {
  it("returns true when user has at least one required permission", () => {
    const perms: Permission[] = ["users.read.basic"];
    expect(
      hasAnyPermission(perms, ["users.read.basic", "users.update.profile"]),
    ).toBe(true);
  });

  it("returns false when user has none of the required permissions", () => {
    const perms: Permission[] = ["roles.read.detail"];
    expect(
      hasAnyPermission(perms, ["users.read.basic", "users.update.profile"]),
    ).toBe(false);
  });

  it("returns false when user permissions are undefined", () => {
    expect(hasAnyPermission(undefined, ["users.read.basic"])).toBe(false);
  });

  it("returns false when required permissions list is empty", () => {
    const perms: Permission[] = ["users.read.basic"];
    expect(hasAnyPermission(perms, [])).toBe(false);
  });

  it("returns true when user has all required permissions listed", () => {
    const perms: Permission[] = [
      "users.read.basic",
      "users.update.profile",
      "users.delete",
    ];
    expect(hasAnyPermission(perms, ["users.update.profile"])).toBe(true);
  });
});

describe("matchesPermissionCheck", () => {
  it("requires both all and any branches when both are provided", () => {
    const perms: Permission[] = ["users.list", "users.read.stats"];

    expect(
      matchesPermissionCheck(perms, {
        all: ["users.list"],
        any: ["users.read.stats", "roles.list"],
      }),
    ).toBe(true);
  });
});

describe("getPermissionsFromUser", () => {
  it("prefers top-level permissions when present", () => {
    expect(
      getPermissionsFromUser({
        permissions: ["users.list"],
        role: { permissions: ["roles.list"] },
      }),
    ).toEqual(["users.list"]);
  });

  it("falls back to nested role permissions", () => {
    expect(
      getPermissionsFromUser({
        role: { permissions: ["roles.list"] },
      }),
    ).toEqual(["roles.list"]);
  });
});

describe("hasPermissionMetadata", () => {
  it("returns true when top-level permissions exist", () => {
    expect(hasPermissionMetadata({ permissions: ["users.list"] })).toBe(true);
  });

  it("returns true when role permissions exist", () => {
    expect(
      hasPermissionMetadata({ role: { permissions: ["roles.list"] } }),
    ).toBe(true);
  });

  it("returns false when permission fields are absent", () => {
    expect(hasPermissionMetadata({ role: { name: "panel_admin" } })).toBe(
      false,
    );
  });
});
