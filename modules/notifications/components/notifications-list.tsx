"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useQueryState, parseAsInteger } from "nuqs";
import { toast } from "sonner";
import { Trash2, Check } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { DataTablePagination } from "@/shared/components/data-table/data-table-pagination";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/shared/lib/ui-config";
import { formatRelativeTime } from "@/shared/utils/date";
import { getErrorMessage } from "@/lib/errors";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "../queries/notifications.queries";
import { notificationsKeys } from "../notifications.keys";

export function NotificationsList() {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const markReadGate = usePermissionGate({
    all: ["notifications.update.read"],
  });
  const markAllReadGate = usePermissionGate({
    all: ["notifications.update.all_read"],
  });
  const deleteNotificationGate = usePermissionGate({
    all: ["notifications.delete"],
  });

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: notificationsKeys.list(page),
    queryFn: () => fetchNotifications({ page, size: DEFAULT_TABLE_PAGE_SIZE }),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
  }

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      toast.success(t("successMessages.markedRead"));
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      toast.success(t("successMessages.allMarkedRead"));
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      toast.success(t("successMessages.deleted"));
      invalidate();
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {(markAllReadGate.isAllowed || markAllReadGate.isLoading) && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={
              markAllReadGate.isLoading ||
              markAllMutation.isPending ||
              items.every((n) => n.is_read)
            }
          >
            {t("markAllRead")}
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="divide-y rounded-md border">
          {items.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkRead={
                markReadGate.isAllowed
                  ? (id) => markReadMutation.mutate(id)
                  : undefined
              }
              onDelete={
                deleteNotificationGate.isAllowed
                  ? (n) => setDeleteTarget(n)
                  : undefined
              }
              isMarkingRead={
                markReadGate.isLoading || markReadMutation.isPending
              }
            />
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <DataTablePagination
          page={page}
          totalPages={data.pages}
          total={data.total}
          onPageChange={(p) => void setPage(p)}
        />
      )}

      {deleteNotificationGate.isAllowed && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={t("deleteDialog.title")}
          description={t("deleteDialog.description")}
          confirmLabel={t("deleteDialog.confirm")}
          cancelLabel={tCommon("cancel")}
          variant="destructive"
          loading={deleteMutation.isPending}
          onConfirm={() =>
            deleteTarget && deleteMutation.mutate(deleteTarget.id)
          }
        />
      )}
    </div>
  );
}

interface NotificationRowProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (n: Notification) => void;
  isMarkingRead: boolean;
}

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
  isMarkingRead,
}: NotificationRowProps) {
  const t = useTranslations("notifications");

  const typeLabels: Record<string, string> = {
    info: t("types.info"),
    success: t("types.success"),
    warning: t("types.warning"),
    error: t("types.error"),
    system: t("types.system"),
    mention: t("types.mention"),
    file_processed: t("types.file_processed"),
  };
  const typeLabel = typeLabels[notification.type] ?? notification.type;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${!notification.is_read ? "bg-muted/40" : ""}`}
    >
      {!notification.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
      {notification.is_read && <div className="mt-2 h-2 w-2 shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs capitalize">
            {typeLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(notification.created_at)}
          </span>
          {!notification.is_read && (
            <Badge variant="secondary" className="text-xs">
              {t("unread")}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm font-medium">{notification.title}</p>
        {notification.body && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {notification.body}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!notification.is_read && onMarkRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarkingRead}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(notification)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
