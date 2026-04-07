"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useQueryState, parseAsInteger, parseAsString } from "nuqs"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"
import { DataTable } from "@/shared/components/data-table/data-table"
import { DataTablePagination } from "@/shared/components/data-table/data-table-pagination"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { formatDateTime } from "@/shared/utils/date"
import { fetchAuditLogs, type AuditLog } from "../queries/audit-logs.queries"
import { AuditLogDetailSheet } from "./audit-log-detail-sheet"

export function AuditLogsTable() {
  const t = useTranslations("auditLogs")
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [userId, setUserId] = useQueryState("user_id", parseAsString.withDefault(""))
  const [dateFrom, setDateFrom] = useQueryState("date_from", parseAsString.withDefault(""))
  const [dateTo, setDateTo] = useQueryState("date_to", parseAsString.withDefault(""))
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const filters = {
    page,
    size: 20,
    user_id: userId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => fetchAuditLogs(filters),
  })

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
        <span className="text-sm font-mono">{row.original.ip_address ?? "—"}</span>
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
          onClick={() => { setSelectedLog(row.original); setSheetOpen(true) }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={t("filters.userId")}
          className="h-9 w-64"
          value={userId}
          onChange={(e) => {
            void setUserId(e.target.value || null)
            void setPage(1)
          }}
        />
        <Input
          type="date"
          className="h-9 w-40"
          placeholder={t("filters.dateFrom")}
          value={dateFrom}
          onChange={(e) => {
            void setDateFrom(e.target.value || null)
            void setPage(1)
          }}
        />
        <Input
          type="date"
          className="h-9 w-40"
          placeholder={t("filters.dateTo")}
          value={dateTo}
          onChange={(e) => {
            void setDateTo(e.target.value || null)
            void setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={t("empty")}
      />

      {data && data.pages > 1 && (
        <DataTablePagination
          page={page}
          totalPages={data.pages}
          total={data.total}
          onPageChange={(p) => void setPage(p)}
        />
      )}

      <AuditLogDetailSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
