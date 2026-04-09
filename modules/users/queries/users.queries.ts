import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components, operations } from "@/types/api.generated";

export type User = components["schemas"]["UserResponse"];
export type DeletedUser = components["schemas"]["DeletedUserResponse"];
export type UserStats = components["schemas"]["UserStatsResponse"];

export type UsersListParams =
  operations["list_users_api_v1_users_get"]["parameters"]["query"];

export async function fetchUsers(params: UsersListParams = {}) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/users", {
      params: { query: params },
    }),
  );
}

export async function fetchUserStats() {
  return unwrapApiResult(await apiClient.GET("/api/v1/users/stats"));
}

export async function fetchDeletedUsers(params: UsersListParams = {}) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/users/deleted", {
      params: { query: params },
    }),
  );
}

export async function fetchUser(id: string) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/users/{user_id}", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function activateUser(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/users/{user_id}/activate", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function deactivateUser(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/users/{user_id}/deactivate", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function deleteUser(id: string) {
  return unwrapApiResult(
    await apiClient.DELETE("/api/v1/users/{user_id}", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function restoreUser(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/users/{user_id}/restore", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function changeUserRole(id: string, role_name: string) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/users/{user_id}/role", {
      params: { path: { user_id: id } },
      body: { role_name },
    }),
  );
}
