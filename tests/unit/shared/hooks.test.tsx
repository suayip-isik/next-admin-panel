import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_ME_QUERY_KEY,
  useCurrentUser,
  useSessionMeta,
} from "@/shared/hooks/use-session-meta";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

describe("shared hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("debounces value updates", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      {
        initialProps: { value: "en" },
      },
    );

    rerender({ value: "tr" });
    expect(result.current).toBe("en");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("tr");
  });

  it("fetches the current user with a stable auth query key", async () => {
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: {
        id: "user-1",
        email: "admin@example.com",
        role: { name: "panel_admin" },
      },
    } as never);

    const queryClient = new QueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.email).toBe("admin@example.com");
    expect(result.current.dataUpdatedAt).toBeGreaterThan(0);
    expect(AUTH_ME_QUERY_KEY).toEqual(["auth", "me"]);
    expect(apiClient.GET).toHaveBeenCalledWith("/api/v1/shared/me");
  });

  it("maps session metadata for the UI", async () => {
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: {
        id: "user-1",
        email: "admin@example.com",
        role: { name: "panel_admin" },
      },
    } as never);

    const queryClient = new QueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useSessionMeta(), { wrapper });

    await waitFor(() =>
      expect(result.current).toEqual({
        id: "user-1",
        email: "admin@example.com",
        role: "panel_admin",
        avatarUrl: null,
      }),
    );
  });
});
