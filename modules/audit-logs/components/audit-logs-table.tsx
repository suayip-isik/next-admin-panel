"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { formatDateTime } from "@/shared/utils/date";
import {
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
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = {
    size: 20,
    user_id: userId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };

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
    });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

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
      cell: ({ row }) => (
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
      ),
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
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
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
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
