"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCount } from "@/modules/notifications/queries/notifications.queries";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { notificationsKeys } from "@/modules/notifications/notifications.keys";

export function NotificationBell() {
  const gate = usePermissionGate({
    all: ["notifications.read.unread_count"],
  });

  const { data } = useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    retry: false,
    enabled: gate.status === "allowed",
  });

  if (gate.isLoading) {
    return (
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground opacity-50">
        <Bell className="h-4 w-4" />
      </span>
    );
  }

  if (!gate.isAllowed) {
    return null;
  }

  const count = data?.count ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
