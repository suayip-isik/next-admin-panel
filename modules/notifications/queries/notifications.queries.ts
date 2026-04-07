import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type Notification = components["schemas"]["NotificationResponse"];

export interface NotificationsParams {
  page?: number;
  size?: number;
}

export async function fetchNotifications(params: NotificationsParams = {}) {
  const { data, error } = await apiClient.GET("/api/v1/notifications", {
    params: { query: params as Record<string, unknown> },
  });
  if (error) throw error;
  return data;
}

export async function fetchUnreadCount() {
  const { data, error } = await apiClient.GET(
    "/api/v1/notifications/unread-count",
  );
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id: string) {
  const { data, error } = await apiClient.PATCH(
    "/api/v1/notifications/{notification_id}",
    { params: { path: { notification_id: id } } },
  );
  if (error) throw error;
  return data;
}

export async function markAllNotificationsRead() {
  const { data, error } = await apiClient.PATCH(
    "/api/v1/notifications/read-all",
  );
  if (error) throw error;
  return data;
}

export async function deleteNotification(id: string) {
  const { data, error } = await apiClient.DELETE(
    "/api/v1/notifications/{notification_id}",
    { params: { path: { notification_id: id } } },
  );
  if (error) throw error;
  return data;
}
