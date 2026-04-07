"use client"

import { useTranslations } from "next-intl"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { formatDateTime } from "@/shared/utils/date"
import type { AuditLog } from "../queries/audit-logs.queries"

interface Props {
  log: AuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailSheet({ log, open, onOpenChange }: Props) {
  const t = useTranslations("auditLogs")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("detail.title")}</SheetTitle>
        </SheetHeader>
        {log && (
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("detail.action")}</p>
              <Badge variant="outline" className="font-mono text-xs">
                {log.action}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("detail.user")}</p>
                <p className="text-sm font-medium truncate">
                  {log.user_id ?? t("anonymous")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("detail.ipAddress")}</p>
                <p className="text-sm font-mono">{log.ip_address ?? "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("detail.userAgent")}</p>
              <p className="text-xs text-muted-foreground break-words">
                {log.user_agent ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("detail.timestamp")}</p>
              <p className="text-sm">{formatDateTime(log.created_at)}</p>
            </div>

            {log.extra && Object.keys(log.extra).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{t("detail.extra")}</p>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto">
                    {JSON.stringify(log.extra, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
