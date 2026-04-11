import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components, operations } from "@/types/api.generated";

export type User = components["schemas"]["UserResponse"];
export type DeletedUser = components["schemas"]["DeletedUserResponse"];
export type UserStats = components["schemas"]["UserStatsResponse"];
export type CreateAdminUserInput =
  components["schemas"]["CreateAdminUserRequest"];
export type UpdateAdminUserInput =
  components["schemas"]["AdminUpdateUserRequest"];
export type ChangeUserEmailInput =
  components["schemas"]["AdminChangeUserEmailRequest"];

export type UsersListParams =
  operations["list_users_api_v1_admin_users_get"]["parameters"]["query"];

export async function fetchUsers(params: UsersListParams = {}) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/users", {
      params: { query: params },
    }),
  );
}

export async function fetchUserStats() {
  return unwrapApiResult(await apiClient.GET("/api/v1/admin/users/stats"));
}

export async function fetchDeletedUsers(params: UsersListParams = {}) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/users/deleted", {
      params: { query: params },
    }),
  );
}

export async function fetchUser(id: string) {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/admin/users/{user_id}", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function createAdminUser(input: CreateAdminUserInput) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/users", {
      body: input,
    }),
  );
}

export async function updateUser(id: string, input: UpdateAdminUserInput) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/admin/users/{user_id}", {
      params: { path: { user_id: id } },
      body: input,
    }),
  );
}

export async function activateUser(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/users/{user_id}/activate", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function deactivateUser(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/users/{user_id}/deactivate", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function deleteUser(id: string) {
  return unwrapApiResult(
    await apiClient.DELETE("/api/v1/admin/users/{user_id}", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function restoreUser(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/users/{user_id}/restore", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function changeUserRole(id: string, role_name: string) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/admin/users/{user_id}/role", {
      params: { path: { user_id: id } },
      body: { role_name },
    }),
  );
}

export async function changeUserEmail(id: string, input: ChangeUserEmailInput) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/users/{user_id}/change-email", {
      params: { path: { user_id: id } },
      body: input,
    }),
  );
}

export async function resendUserVerification(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/users/{user_id}/resend-verification", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function resendAdminInvite(id: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/admin/users/{user_id}/resend-invite", {
      params: { path: { user_id: id } },
    }),
  );
}

export async function uploadUserAvatar(id: string, file: File) {
  const body = new FormData();
  body.set("file", file);

  return unwrapApiResult(
    await apiClient.PUT("/api/v1/admin/users/{user_id}/avatar", {
      params: { path: { user_id: id } },
      body: body as never,
    }),
  );
}

export async function deleteUserAvatar(id: string) {
  return unwrapApiResult(
    await apiClient.DELETE("/api/v1/admin/users/{user_id}/avatar", {
      params: { path: { user_id: id } },
    }),
  );
}
