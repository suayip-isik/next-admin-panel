import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  fetchDeletedUsers,
  fetchUsers,
} from "@/modules/users/queries/users.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

describe("users queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: { items: [] },
    } as never);
  });

  it("sends the free-text query as q for active users", async () => {
    await fetchUsers({ page: 2, size: 20, q: "Ada Lovelace" });

    expect(apiClient.GET).toHaveBeenCalledWith("/api/v1/users", {
      params: {
        query: {
          page: 2,
          size: 20,
          q: "Ada Lovelace",
        },
      },
    });
  });

  it("sends the free-text query as q for deleted users", async () => {
    await fetchDeletedUsers({ q: "Grace Hopper" });

    expect(apiClient.GET).toHaveBeenCalledWith("/api/v1/users/deleted", {
      params: {
        query: {
          q: "Grace Hopper",
        },
      },
    });
  });
});
