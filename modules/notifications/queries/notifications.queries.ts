import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";

export type Notification = components["schemas"]["NotificationResponse"];

export interface NotificationsParams {
  page?: number;
  size?: number;
}

export async function fetchNotifications(params: NotificationsParams = {}) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/notifications", {
      params: { query: params as Record<string, unknown> },
    }),
  );
}

export async function fetchUnreadCount() {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/notifications/unread-count"),
  );
}

export async function markNotificationRead(id: string) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/notifications/{notification_id}", {
      params: { path: { notification_id: id } },
    }),
  );
}

export async function markAllNotificationsRead() {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/notifications/read-all"),
  );
}

export async function deleteNotification(id: string) {
  return unwrapApiResult(
    await apiClient.DELETE("/api/v1/notifications/{notification_id}", {
      params: { path: { notification_id: id } },
    }),
  );
}
