import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  fetchAuditLog,
  fetchAuditLogs,
} from "@/modules/audit-logs/queries/audit-logs.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

describe("audit log queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({ data: {} } as never);
  });

  it("uses the expected audit log endpoints", async () => {
    await fetchAuditLogs({
      page: 1,
      size: 25,
      action: "users_deleted",
      user_id: "user-1",
    });
    await fetchAuditLog("log-1");

    expect(apiClient.GET).toHaveBeenNthCalledWith(
      1,
      "/api/v1/audit-logs",
      {
        params: {
          query: {
            page: 1,
            size: 25,
            action: "users_deleted",
            user_id: "user-1",
          },
        },
      },
    );
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      2,
      "/api/v1/audit-logs/{log_id}",
      {
        params: { path: { log_id: "log-1" } },
      },
    );
  });
});
