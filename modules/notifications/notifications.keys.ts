export const notificationsKeys = {
  all: ["notifications"] as const,
  list: (page: number) => [...notificationsKeys.all, "list", { page }] as const,
  unreadCount: () => [...notificationsKeys.all, "unread-count"] as const,
};
