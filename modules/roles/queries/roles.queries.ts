import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../schemas/roles.schemas";

export type Role = components["schemas"]["RoleResponse"];

export async function fetchRoles() {
  return unwrapApiResult(await apiClient.GET("/api/v1/admin/roles"));
}

export async function fetchRole(id: string) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/roles/{role_id}", {
      params: { path: { role_id: id } },
    }),
  );
}

export async function createRole(input: CreateRoleInput) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/roles", {
      body: input,
    }),
  );
}

export async function updateRole(id: string, input: UpdateRoleInput) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/admin/roles/{role_id}", {
      params: { path: { role_id: id } },
      body: input,
    }),
  );
}

export async function deleteRole(id: string) {
  return unwrapApiResult(
    await apiClient.DELETE("/api/v1/admin/roles/{role_id}", {
      params: { path: { role_id: id } },
    }),
  );
}
