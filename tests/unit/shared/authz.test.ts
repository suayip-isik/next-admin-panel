import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import {
  createResolvedSnapshot,
  createUnavailableSnapshot,
  type CurrentUser,
  getCurrentRoleId,
  getRolePermissions,
  getTopLevelPermissions,
  hasPermissionMetadata,
  normalizePermissions,
  resolveClientAuthzSnapshot,
  resolvePermissionsFromUser,
} from "@/shared/lib/authz";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

function createCurrentUser(
  overrides: Partial<CurrentUser> = {},
  roleOverrides: Record<string, unknown> = {},
): CurrentUser {
  return {
    id: "user-1",
    email: "admin@example.com",
    username: null,
    full_name: null,
    avatar_url: null,
    surface: "admin",
    is_active: true,
    is_verified: true,
    has_pending_email: false,
    verification_required: false,
    role: {
      id: "role-1",
      name: "panel_admin",
      is_system: true,
      ...roleOverrides,
    } as CurrentUser["role"],
    ...overrides,
  };
}

describe("shared authz helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes permission metadata from both user and role records", () => {
    const user = {
      id: "user-1",
      email: "admin@example.com",
      surface: "admin",
      permissions: ["users.list"],
      role: {
        id: "role-1",
        name: "panel_admin",
        is_system: true,
        permissions: ["roles.list"],
      },
      avatar_url: null,
      full_name: null,
      username: null,
      is_active: true,
      is_verified: true,
      has_pending_email: false,
      verification_required: false,
    };

    expect(normalizePermissions(undefined)).toEqual([]);
    expect(getTopLevelPermissions(user)).toEqual(["users.list"]);
    expect(getRolePermissions(user)).toEqual(["roles.list"]);
    expect(getCurrentRoleId(user)).toBe("role-1");
    expect(hasPermissionMetadata(user)).toBe(true);
    expect(hasPermissionMetadata(undefined)).toBe(false);
  });

  it("creates resolved and unavailable snapshots", () => {
    const user = createCurrentUser();

    expect(
      createResolvedSnapshot(user, ["users.list"], "user.permissions"),
    ).toMatchObject({
      user,
      permissions: ["users.list"],
      state: "resolved",
      source: "user.permissions",
    });
    expect(createUnavailableSnapshot(user)).toMatchObject({
      user,
      permissions: [],
      state: "unavailable",
      source: "unavailable",
    });
  });

  it("resolves permissions directly from the current user when available", () => {
    const userWithTopLevelPermissions = createCurrentUser({
      permissions: ["users.list"],
    });
    const userWithRolePermissions: CurrentUser = {
      ...userWithTopLevelPermissions,
      permissions: [],
      role: {
        ...userWithTopLevelPermissions.role,
        permissions: ["roles.list"],
      },
    };
    const userWithoutPermissions: CurrentUser = {
      ...userWithTopLevelPermissions,
      permissions: [],
      role: userWithTopLevelPermissions.role,
    };

    expect(resolvePermissionsFromUser(userWithTopLevelPermissions)).toEqual({
      snapshot: expect.objectContaining({
        permissions: ["users.list"],
        source: "user.permissions",
      }),
      roleId: null,
    });
    expect(resolvePermissionsFromUser(userWithRolePermissions)).toEqual({
      snapshot: expect.objectContaining({
        permissions: ["roles.list"],
        source: "role.permissions",
      }),
      roleId: null,
    });
    expect(resolvePermissionsFromUser(userWithoutPermissions)).toEqual({
      snapshot: null,
      roleId: "role-1",
    });
  });

  it("returns a resolved client snapshot from /me without loading role detail", async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: {
        id: "user-1",
        email: "admin@example.com",
        surface: "admin",
        permissions: ["users.list"],
        role: {
          id: "role-1",
          name: "panel_admin",
          is_system: true,
        },
        avatar_url: null,
        full_name: null,
        username: null,
        is_active: true,
        is_verified: true,
        has_pending_email: false,
        verification_required: false,
      },
    } as never);

    await expect(resolveClientAuthzSnapshot()).resolves.toMatchObject({
      permissions: ["users.list"],
      state: "resolved",
      source: "user.permissions",
    });
    expect(apiClient.GET).toHaveBeenCalledTimes(1);
  });

  it("loads role detail when /me lacks permission metadata", async () => {
    vi.mocked(apiClient.GET)
      .mockResolvedValueOnce({
        data: {
          id: "user-1",
          email: "admin@example.com",
          surface: "admin",
          role: {
            id: "role-1",
            name: "panel_admin",
            is_system: true,
          },
          avatar_url: null,
          full_name: null,
          username: null,
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          id: "role-1",
          name: "panel_admin",
          is_system: true,
          permissions: ["roles.list"],
        },
      } as never);

    await expect(resolveClientAuthzSnapshot()).resolves.toMatchObject({
      permissions: ["roles.list"],
      state: "resolved",
      source: "role-detail",
      user: {
        role: {
          id: "role-1",
          permissions: ["roles.list"],
        },
      },
    });
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      2,
      "/api/v1/admin/roles/{role_id}",
      {
        params: { path: { role_id: "role-1" } },
      },
    );
  });

  it("returns an unavailable snapshot when no permissions or role id exist", async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: {
        id: "user-1",
        email: "admin@example.com",
        surface: "admin",
        role: {
          id: "",
          name: "panel_admin",
          is_system: true,
        },
        avatar_url: null,
        full_name: null,
        username: null,
        is_active: true,
        is_verified: true,
        has_pending_email: false,
        verification_required: false,
      },
    } as never);

    await expect(resolveClientAuthzSnapshot()).resolves.toMatchObject({
      permissions: [],
      state: "unavailable",
      source: "unavailable",
    });
  });

  it("returns an unavailable snapshot for forbidden role detail and rethrows other failures", async () => {
    vi.mocked(apiClient.GET)
      .mockResolvedValueOnce({
        data: {
          id: "user-1",
          email: "admin@example.com",
          surface: "admin",
          role: {
            id: "role-1",
            name: "panel_admin",
            is_system: true,
          },
          avatar_url: null,
          full_name: null,
          username: null,
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        },
      } as never)
      .mockResolvedValueOnce({
        error: { detail: "Forbidden" },
        response: new Response(null, { status: 403 }),
      } as never);

    await expect(resolveClientAuthzSnapshot()).resolves.toMatchObject({
      permissions: [],
      state: "unavailable",
      source: "unavailable",
    });

    vi.mocked(apiClient.GET)
      .mockResolvedValueOnce({
        data: {
          id: "user-2",
          email: "admin@example.com",
          surface: "admin",
          role: {
            id: "role-2",
            name: "panel_admin",
            is_system: true,
          },
          avatar_url: null,
          full_name: null,
          username: null,
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        },
      } as never)
      .mockRejectedValueOnce(new AppError(500, "SERVER_ERROR", "boom"));

    await expect(resolveClientAuthzSnapshot()).rejects.toThrow("boom");
  });
});
