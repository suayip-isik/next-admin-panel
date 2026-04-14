import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getServerCurrentUser,
  requireAdminSurface,
  requireAuthenticatedUser,
  requireNamedPageAccess,
  requirePageAccess,
  resolveServerAuthzSnapshot,
} from "@/lib/auth/server-access";

const redirectMock = vi.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});
const forbiddenMock = vi.fn(() => {
  throw new Error("forbidden");
});

vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    redirect: (path: string) => redirectMock(path),
    forbidden: () => forbiddenMock(),
  };
});

vi.mock("@/lib/auth/cookies", () => ({
  getAccessTokenFromCookies: vi.fn(),
}));

vi.mock("@/lib/auth/fastapi", () => ({
  forwardToFastApi: vi.fn(),
}));

describe("server auth access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null current user when there is no access token or the backend returns 401", async () => {
    const { getAccessTokenFromCookies } = await import("@/lib/auth/cookies");
    const { forwardToFastApi } = await import("@/lib/auth/fastapi");

    vi.mocked(getAccessTokenFromCookies).mockResolvedValueOnce(null);
    await expect(getServerCurrentUser()).resolves.toBeNull();

    vi.mocked(getAccessTokenFromCookies).mockResolvedValueOnce("access-1");
    vi.mocked(forwardToFastApi).mockResolvedValueOnce(
      new Response(null, { status: 401 }),
    );

    await expect(getServerCurrentUser()).resolves.toBeNull();
  });

  it("throws when loading the current user fails unexpectedly", async () => {
    const { getAccessTokenFromCookies } = await import("@/lib/auth/cookies");
    const { forwardToFastApi } = await import("@/lib/auth/fastapi");

    vi.mocked(getAccessTokenFromCookies).mockResolvedValueOnce("access-1");
    vi.mocked(forwardToFastApi).mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );

    await expect(getServerCurrentUser()).rejects.toThrow(
      "Failed to fetch current user: 500",
    );
  });

  it("resolves server authz from current-user permissions without loading role detail", async () => {
    const { getAccessTokenFromCookies } = await import("@/lib/auth/cookies");
    const { forwardToFastApi } = await import("@/lib/auth/fastapi");

    vi.mocked(getAccessTokenFromCookies)
      .mockResolvedValueOnce("access-1")
      .mockResolvedValueOnce("access-1");
    vi.mocked(forwardToFastApi).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "user-1",
          email: "admin@example.com",
          username: "admin",
          full_name: "Admin",
          avatar_url: null,
          surface: "admin",
          permissions: ["users.list"],
          role: {
            id: "role-1",
            name: "panel_admin",
            is_system: true,
          },
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(resolveServerAuthzSnapshot()).resolves.toMatchObject({
      permissions: ["users.list"],
      state: "resolved",
      source: "user.permissions",
    });
    expect(forwardToFastApi).toHaveBeenCalledTimes(1);
  });

  it("returns an unavailable snapshot when role detail is forbidden and resolves it when available", async () => {
    const { getAccessTokenFromCookies } = await import("@/lib/auth/cookies");
    const { forwardToFastApi } = await import("@/lib/auth/fastapi");

    vi.mocked(getAccessTokenFromCookies)
      .mockResolvedValueOnce("access-1")
      .mockResolvedValueOnce("access-1");
    vi.mocked(forwardToFastApi)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "user-1",
            email: "admin@example.com",
            username: "admin",
            full_name: "Admin",
            avatar_url: null,
            surface: "admin",
            role: {
              id: "role-1",
              name: "panel_admin",
              is_system: true,
            },
            is_active: true,
            is_verified: true,
            has_pending_email: false,
            verification_required: false,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 403 }));

    await expect(resolveServerAuthzSnapshot()).resolves.toMatchObject({
      permissions: [],
      state: "unavailable",
      source: "unavailable",
    });

    vi.mocked(getAccessTokenFromCookies)
      .mockResolvedValueOnce("access-2")
      .mockResolvedValueOnce("access-2");
    vi.mocked(forwardToFastApi)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "user-2",
            email: "admin@example.com",
            username: "admin",
            full_name: "Admin",
            avatar_url: null,
            surface: "admin",
            role: {
              id: "role-2",
              name: "panel_admin",
              is_system: true,
            },
            is_active: true,
            is_verified: true,
            has_pending_email: false,
            verification_required: false,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "role-2",
            name: "panel_admin",
            is_system: true,
            permissions: ["roles.read.detail"],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

    await expect(resolveServerAuthzSnapshot()).resolves.toMatchObject({
      permissions: ["roles.read.detail"],
      state: "resolved",
      source: "role-detail",
    });
  });

  it("redirects unauthenticated users and forbids unauthorized admin access", async () => {
    const { getAccessTokenFromCookies } = await import("@/lib/auth/cookies");
    const { forwardToFastApi } = await import("@/lib/auth/fastapi");

    vi.mocked(getAccessTokenFromCookies).mockResolvedValueOnce(null);
    await expect(requireAuthenticatedUser()).rejects.toThrow("redirect:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");

    vi.mocked(getAccessTokenFromCookies)
      .mockResolvedValueOnce("access-1")
      .mockResolvedValueOnce("access-1");
    vi.mocked(forwardToFastApi).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "user-1",
          email: "member@example.com",
          username: "member",
          full_name: "Member",
          avatar_url: null,
          surface: "member",
          permissions: ["profile.read.self"],
          role: {
            id: "role-1",
            name: "member",
            is_system: false,
          },
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(requireAdminSurface()).rejects.toThrow("forbidden");
    expect(forbiddenMock).toHaveBeenCalled();
  });

  it("forbids unresolved page access and accepts named non-admin routes", async () => {
    const { getAccessTokenFromCookies } = await import("@/lib/auth/cookies");
    const { forwardToFastApi } = await import("@/lib/auth/fastapi");

    vi.mocked(getAccessTokenFromCookies)
      .mockResolvedValueOnce("access-1")
      .mockResolvedValueOnce("access-1");
    vi.mocked(forwardToFastApi)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "user-1",
            email: "admin@example.com",
            username: "admin",
            full_name: "Admin",
            avatar_url: null,
            surface: "admin",
            role: {
              id: "role-1",
              name: "panel_admin",
              is_system: true,
            },
            is_active: true,
            is_verified: true,
            has_pending_email: false,
            verification_required: false,
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(requirePageAccess({ all: ["users.list"] })).rejects.toThrow(
      "forbidden",
    );

    vi.mocked(getAccessTokenFromCookies)
      .mockResolvedValueOnce("access-2")
      .mockResolvedValueOnce("access-2");
    vi.mocked(forwardToFastApi).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "user-2",
          email: "admin@example.com",
          username: "admin",
          full_name: "Admin",
          avatar_url: null,
          surface: "admin",
          permissions: ["profile.read.self"],
          role: {
            id: "role-2",
            name: "panel_admin",
            is_system: true,
          },
          is_active: true,
          is_verified: true,
          has_pending_email: false,
          verification_required: false,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(requireNamedPageAccess("profile")).resolves.toMatchObject({
      permissions: ["profile.read.self"],
      source: "user.permissions",
    });
  });
});
