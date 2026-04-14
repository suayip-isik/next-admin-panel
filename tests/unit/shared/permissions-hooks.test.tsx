import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useHasAllPermissions,
  useHasAnyPermission,
  useHasPermission,
  usePermissionAccess,
  usePermissionGate,
} from "@/shared/hooks/use-permissions";

const useAuthzSnapshotMock = vi.fn();

vi.mock("@/shared/hooks/use-session-meta", () => ({
  useAuthzSnapshot: (...args: unknown[]) => useAuthzSnapshotMock(...args),
  useCurrentUser: vi.fn(),
}));

describe("permission hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates permission helper hooks from the resolved authz snapshot", () => {
    useAuthzSnapshotMock.mockReturnValue({
      data: {
        state: "resolved",
        permissions: ["users.read.basic", "roles.update.permissions"],
      },
      isLoading: false,
      isFetching: false,
    });

    const { result: hasPermissionResult } = renderHook(() =>
      useHasPermission("users.read.basic"),
    );
    const { result: hasAllPermissionResult } = renderHook(() =>
      useHasAllPermissions(["users.read.basic", "roles.update.permissions"]),
    );
    const { result: hasAnyPermissionResult } = renderHook(() =>
      useHasAnyPermission(["audit_logs.list", "roles.update.permissions"]),
    );

    expect(hasPermissionResult.current).toBe(true);
    expect(hasAllPermissionResult.current).toBe(true);
    expect(hasAnyPermissionResult.current).toBe(true);
  });

  it("returns loading while the centralized authz snapshot is resolving", () => {
    useAuthzSnapshotMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
    });

    const { result } = renderHook(() =>
      usePermissionGate({ all: ["users.list"] }),
    );

    expect(result.current).toEqual({
      isAllowed: false,
      isLoading: true,
      status: "loading",
    });
  });

  it("denies access when permission resolution is unavailable", () => {
    useAuthzSnapshotMock.mockReturnValue({
      data: {
        state: "unavailable",
        permissions: [],
      },
      isLoading: false,
      isFetching: false,
    });

    const { result: gateResult } = renderHook(() =>
      usePermissionGate({ all: ["users.list"] }),
    );
    const { result: accessResult } = renderHook(() =>
      usePermissionAccess({ all: ["users.list"] }),
    );

    expect(gateResult.current.status).toBe("unavailable");
    expect(accessResult.current).toBe(false);
  });
});
