import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";

export type AuditLog = components["schemas"]["AuditLogResponse"];

export interface AuditLogsFilters {
  page?: number;
  size?: number;
  action?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export async function fetchAuditLogs(filters: AuditLogsFilters = {}) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/audit-logs", {
      params: { query: filters as Record<string, unknown> },
    }),
  );
}

export async function fetchAuditLog(id: string) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/audit-logs/{log_id}", {
      params: { path: { log_id: id } },
    }),
  );
}
