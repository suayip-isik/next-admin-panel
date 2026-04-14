import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  createApiKey,
  deleteApiKey,
  fetchApiKeys,
} from "@/modules/api-keys/queries/api-keys.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
    DELETE: vi.fn(),
  },
}));

describe("api key queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.POST).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.DELETE).mockResolvedValue({ data: {} } as never);
  });

  it("uses the expected api key endpoints", async () => {
    await fetchApiKeys();
    await createApiKey({
      name: "CI token",
      scopes: ["users.read.basic"],
      expires_at: "2026-12-31T00:00:00Z",
    });
    await deleteApiKey("key-1");

    expect(apiClient.GET).toHaveBeenCalledWith("/api/v1/shared/api-keys");
    expect(apiClient.POST).toHaveBeenCalledWith("/api/v1/shared/api-keys", {
      body: {
        name: "CI token",
        scopes: ["users.read.basic"],
        expires_at: "2026-12-31T00:00:00Z",
      },
    });
    expect(apiClient.DELETE).toHaveBeenCalledWith(
      "/api/v1/shared/api-keys/{key_id}",
      {
        params: { path: { key_id: "key-1" } },
      },
    );
  });
});
