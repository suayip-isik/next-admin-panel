import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type User = components["schemas"]["UserResponse"];
export type DeletedUser = components["schemas"]["DeletedUserResponse"];
export type UserStats = components["schemas"]["UserStatsResponse"];

export interface UsersListParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}

export async function fetchUsers(params: UsersListParams = {}) {
  const { data, error } = await apiClient.GET("/api/v1/users", {
    params: { query: params as Record<string, unknown> },
  });
  if (error) throw error;
  return data;
}

export async function fetchUserStats() {
  const { data, error } = await apiClient.GET("/api/v1/users/stats");
  if (error) throw error;
  return data;
}

export async function fetchDeletedUsers(params: UsersListParams = {}) {
  const { data, error } = await apiClient.GET("/api/v1/users/deleted", {
    params: { query: params as Record<string, unknown> },
  });
  if (error) throw error;
  return data;
}

export async function fetchUser(id: string) {
  const { data, error } = await apiClient.GET("/api/v1/users/{user_id}", {
    params: { path: { user_id: id } },
  });
  if (error) throw error;
  return data;
}

export async function activateUser(id: string) {
  const { data, error } = await apiClient.POST(
    "/api/v1/users/{user_id}/activate",
    { params: { path: { user_id: id } } },
  );
  if (error) throw error;
  return data;
}

export async function deactivateUser(id: string) {
  const { data, error } = await apiClient.POST(
    "/api/v1/users/{user_id}/deactivate",
    { params: { path: { user_id: id } } },
  );
  if (error) throw error;
  return data;
}

export async function deleteUser(id: string) {
  const { data, error } = await apiClient.DELETE("/api/v1/users/{user_id}", {
    params: { path: { user_id: id } },
  });
  if (error) throw error;
  return data;
}

export async function restoreUser(id: string) {
  const { data, error } = await apiClient.POST(
    "/api/v1/users/{user_id}/restore",
    { params: { path: { user_id: id } } },
  );
  if (error) throw error;
  return data;
}

export async function changeUserRole(id: string, role_name: string) {
  const { data, error } = await apiClient.PATCH(
    "/api/v1/users/{user_id}/role",
    {
      params: { path: { user_id: id } },
      body: { role_name },
    },
  );
  if (error) throw error;
  return data;
}
