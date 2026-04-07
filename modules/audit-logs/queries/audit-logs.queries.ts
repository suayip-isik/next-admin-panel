import { apiClient } from "@/lib/api-client"
import type { components } from "@/types/api.generated"

export type AuditLog = components["schemas"]["AuditLogResponse"]

export interface AuditLogsFilters {
  page?: number
  size?: number
  action?: string
  user_id?: string
  date_from?: string
  date_to?: string
}

export async function fetchAuditLogs(filters: AuditLogsFilters = {}) {
  const { data, error } = await apiClient.GET("/api/v1/audit-logs", {
    params: { query: filters as Record<string, unknown> },
  })
  if (error) throw error
  return data
}

export async function fetchAuditLog(id: string) {
  const { data, error } = await apiClient.GET("/api/v1/audit-logs/{log_id}", {
    params: { path: { log_id: id } },
  })
  if (error) throw error
  return data
}
