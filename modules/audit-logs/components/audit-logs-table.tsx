"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/shared/lib/ui-config";
import { formatDateTime } from "@/shared/utils/date";
import {
  fetchAuditLog,
  fetchAuditLogs,
  fetchAuditLogsStream,
  type AuditLog,
} from "../queries/audit-logs.queries";
import { AuditLogDetailSheet } from "./audit-log-detail-sheet";

export function AuditLogsTable() {
  const t = useTranslations("auditLogs");
  const [userId, setUserId] = useQueryState(
    "user_id",
    parseAsString.withDefault(""),
  );
  const [dateFrom, setDateFrom] = useQueryState(
    "date_from",
    parseAsString.withDefault(""),
  );
  const [dateTo, setDateTo] = useQueryState(
    "date_to",
    parseAsString.withDefault(""),
  );
  const [streamMode, setStreamMode] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const readDetailGate = usePermissionGate({
    all: ["audit_logs.read.detail"],
  });
  const streamAuditLogsGate = usePermissionGate({
    all: ["audit_logs.stream"],
  });

  const filters = {
    size: DEFAULT_TABLE_PAGE_SIZE,
    user_id: userId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };

  const listQuery = useQuery({
    queryKey: ["audit-logs", "list", filters],
    queryFn: () => fetchAuditLogs(filters),
    enabled: !streamMode,
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["audit-logs-stream", filters],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam }) =>
        fetchAuditLogsStream({
          ...filters,
          cursor: pageParam,
        }),
      getNextPageParam: (lastPage) =>
        lastPage.has_more ? (lastPage.next_cursor ?? undefined) : undefined,
      enabled: streamMode && streamAuditLogsGate.isAllowed,
    });

  const detailQuery = useQuery({
    queryKey: ["audit-logs", "detail", selectedLog?.id],
    queryFn: () => fetchAuditLog(selectedLog!.id),
    enabled: sheetOpen && !!selectedLog && readDetailGate.isAllowed,
  });

  const items = streamMode
    ? (data?.pages.flatMap((page) => page.items) ?? [])
    : (listQuery.data?.items ?? []);

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "action",
      header: t("columns.action"),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "user_id",
      header: t("columns.user"),
      cell: ({ row }) => (
        <span className="text-sm font-mono text-muted-foreground truncate max-w-[180px] block">
          {row.original.user_id ?? t("anonymous")}
        </span>
      ),
    },
    {
      accessorKey: "ip_address",
      header: t("columns.ip"),
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.original.ip_address ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("columns.timestamp"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        readDetailGate.isLoading ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <Eye className="h-4 w-4" />
          </Button>
        ) : readDetailGate.isAllowed ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedLog(row.original);
              setSheetOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={t("filters.userId")}
          className="h-9 w-64"
          value={userId}
          onChange={(event) => {
            void setUserId(event.target.value || null);
          }}
        />
        <Input
          type="date"
          className="h-9 w-40"
          placeholder={t("filters.dateFrom")}
          value={dateFrom}
          onChange={(event) => {
            void setDateFrom(event.target.value || null);
          }}
        />
        <Input
          type="date"
          className="h-9 w-40"
          placeholder={t("filters.dateTo")}
          value={dateTo}
          onChange={(event) => {
            void setDateTo(event.target.value || null);
          }}
        />
        {(streamAuditLogsGate.isAllowed || streamAuditLogsGate.isLoading) && (
          <Button
            variant={streamMode ? "default" : "outline"}
            onClick={() => setStreamMode((current) => !current)}
            disabled={streamAuditLogsGate.isLoading}
          >
            {streamMode ? t("disableLiveMode") : t("enableLiveMode")}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={streamMode ? isLoading : listQuery.isLoading}
        emptyMessage={t("empty")}
      />

      {(hasNextPage || isFetchingNextPage) && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? t("loadMoreLoading") : t("loadMore")}
          </Button>
        </div>
      )}

      <AuditLogDetailSheet
        log={detailQuery.data ?? selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
