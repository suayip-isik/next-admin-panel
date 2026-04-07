import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";
import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../schemas/roles.schemas";

export type Role = components["schemas"]["RoleResponse"];

export async function fetchRoles() {
  const { data, error } = await apiClient.GET("/api/v1/roles");
  if (error) throw error;
  return data;
}

export async function fetchRole(id: string) {
  const { data, error } = await apiClient.GET("/api/v1/roles/{role_id}", {
    params: { path: { role_id: id } },
  });
  if (error) throw error;
  return data;
}

export async function createRole(input: CreateRoleInput) {
  const { data, error } = await apiClient.POST("/api/v1/roles", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function updateRole(id: string, input: UpdateRoleInput) {
  const { data, error } = await apiClient.PATCH("/api/v1/roles/{role_id}", {
    params: { path: { role_id: id } },
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function deleteRole(id: string) {
  const { data, error } = await apiClient.DELETE("/api/v1/roles/{role_id}", {
    params: { path: { role_id: id } },
  });
  if (error) throw error;
  return data;
}
