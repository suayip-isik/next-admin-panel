import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components, operations } from "@/types/api.generated";

export type AuditLog = components["schemas"]["AuditLogResponse"];
export type AuditLogStreamResponse =
  components["schemas"]["CursorPaginatedResponse_AuditLogResponse_"];

export type AuditLogsFilters =
  operations["list_audit_logs_api_v1_admin_audit_logs_get"]["parameters"]["query"];

export type AuditLogsStreamFilters =
  operations["stream_audit_logs_api_v1_admin_audit_logs_stream_get"]["parameters"]["query"];

export async function fetchAuditLogs(filters: AuditLogsFilters = {}) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/audit-logs", {
      params: { query: filters as Record<string, unknown> },
    }),
  );
}

export async function fetchAuditLogsStream(
  filters: AuditLogsStreamFilters = {},
) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/audit-logs/stream", {
      params: { query: filters },
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
