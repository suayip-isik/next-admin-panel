import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";
import type { CreateRoleInput } from "../schemas/roles.schemas";

export type Role = components["schemas"]["RoleResponse"];
export type UpdateRoleDescriptionInput =
  components["schemas"]["UpdateRoleDescriptionRequest"];
export type ReplaceRolePermissionsInput =
  components["schemas"]["ReplaceRolePermissionsRequest"];

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

export async function updateRoleDescription(
  id: string,
  input: UpdateRoleDescriptionInput,
) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/admin/roles/{role_id}/description", {
      params: { path: { role_id: id } },
      body: input,
    }),
  );
}

export async function replaceRolePermissions(
  id: string,
  input: ReplaceRolePermissionsInput,
) {
  return unwrapApiResult(
    await apiClient.PUT("/api/v1/admin/roles/{role_id}/permissions", {
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
