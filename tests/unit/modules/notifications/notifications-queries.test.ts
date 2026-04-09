import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  deleteNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/modules/notifications/queries/notifications.queries";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    GET: vi.fn(),
    PATCH: vi.fn(),
    DELETE: vi.fn(),
  },
}));

describe("notifications queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.GET).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.PATCH).mockResolvedValue({ data: {} } as never);
    vi.mocked(apiClient.DELETE).mockResolvedValue({ data: {} } as never);
  });

  it("uses the expected notifications endpoints", async () => {
    await fetchNotifications({ page: 2, size: 10 });
    await fetchUnreadCount();
    await markNotificationRead("notification-1");
    await markAllNotificationsRead();
    await deleteNotification("notification-1");

    expect(apiClient.GET).toHaveBeenNthCalledWith(
      1,
      "/api/v1/notifications",
      {
        params: { query: { page: 2, size: 10 } },
      },
    );
    expect(apiClient.GET).toHaveBeenNthCalledWith(
      2,
      "/api/v1/notifications/unread-count",
    );
    expect(apiClient.PATCH).toHaveBeenNthCalledWith(
      1,
      "/api/v1/notifications/{notification_id}",
      {
        params: { path: { notification_id: "notification-1" } },
      },
    );
    expect(apiClient.PATCH).toHaveBeenNthCalledWith(
      2,
      "/api/v1/notifications/read-all",
    );
    expect(apiClient.DELETE).toHaveBeenCalledWith(
      "/api/v1/notifications/{notification_id}",
      {
        params: { path: { notification_id: "notification-1" } },
      },
    );
  });
});
