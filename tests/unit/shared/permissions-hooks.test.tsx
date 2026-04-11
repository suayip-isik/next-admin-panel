import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useHasAnyPermission,
  useHasPermission,
} from "@/shared/hooks/use-permissions";

const useCurrentUserMock = vi.fn();

vi.mock("@/shared/hooks/use-session-meta", () => ({
  useCurrentUser: (...args: unknown[]) => useCurrentUserMock(...args),
}));

describe("permission hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates permission helper hooks from the current role", () => {
    useCurrentUserMock.mockReturnValue({
      data: {
        role: {
          permissions: ["users:view", "roles:update"],
        },
      },
    });

    const { result: hasPermissionResult } = renderHook(() =>
      useHasPermission("users:view"),
    );
    const { result: hasAnyPermissionResult } = renderHook(() =>
      useHasAnyPermission(["audit:list", "roles:update"]),
    );

    expect(hasPermissionResult.current).toBe(true);
    expect(hasAnyPermissionResult.current).toBe(true);
  });
});
