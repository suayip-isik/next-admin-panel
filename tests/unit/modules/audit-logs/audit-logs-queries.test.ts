import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  fetchAuditLog,
  fetchAuditLogs,
  fetchAuditLogsStream,
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
      action: "user_deleted",
      user_id: "user-1",
    });
    await fetchAuditLog("log-1");
    await fetchAuditLogsStream({
      cursor: "cursor-1",
      size: 10,
      user_id: "user-1",
    });

    expect(apiClient.GET).toHaveBeenNthCalledWith(
      1,
      "/api/v1/admin/audit-logs",
      {
        params: {
          query: {
            page: 1,
            size: 25,
            action: "user_deleted",
            user_id: "user-1",
          },
        },
      },
    );
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      2,
      "/api/v1/admin/audit-logs/{log_id}",
      {
        params: { path: { log_id: "log-1" } },
      },
    );
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      3,
      "/api/v1/admin/audit-logs/stream",
      {
        params: {
          query: {
            cursor: "cursor-1",
            size: 10,
            user_id: "user-1",
          },
        },
      },
    );
  });
});
