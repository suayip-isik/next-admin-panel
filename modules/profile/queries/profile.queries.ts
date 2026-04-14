import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";

export type UserProfile = components["schemas"]["UserResponse"];

export type UpdateProfileBasicInput =
  components["schemas"]["UpdateOwnProfileRequest"];
export type UpdateProfileEmailInput =
  components["schemas"]["UpdateOwnEmailRequest"];
export type UpdateProfilePasswordInput =
  components["schemas"]["UpdateOwnPasswordRequest"];

export async function fetchProfile() {
  return unwrapApiResult(await apiClient.GET("/api/v1/shared/me"));
}

export async function updateProfileBasic(input: UpdateProfileBasicInput) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/shared/me/profile", {
      body: input,
    }),
  );
}

export async function updateProfileEmail(input: UpdateProfileEmailInput) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/shared/me/email", {
      body: input,
    }),
  );
}

export async function updateProfilePassword(input: UpdateProfilePasswordInput) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/shared/me/password", {
      body: input,
    }),
  );
}

export async function uploadMyAvatar(file: File) {
  const body = new FormData();
  body.set("file", file);

  return unwrapApiResult(
    await apiClient.PUT("/api/v1/shared/me/avatar", {
      body: body as never,
    }),
  );
}

export async function deleteMyAvatar() {
  return unwrapApiResult(await apiClient.DELETE("/api/v1/shared/me/avatar"));
}

export async function uploadFile(file: File) {
  const body = new FormData();
  body.set("file", file);

  return unwrapApiResult(
    await apiClient.POST("/api/v1/shared/uploads", {
      body: body as never,
    }),
  );
}

export async function deleteFile(key: string) {
  return unwrapApiResult(
    await apiClient.DELETE("/api/v1/shared/uploads", {
      params: { query: { key } },
    }),
  );
}

export async function setupTotp() {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/shared/auth/totp/setup"),
  );
}

export async function verifyTotp(code: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/shared/auth/totp/verify", {
      body: { code },
    }),
  );
}

export async function disableTotp(code: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/shared/auth/totp/disable", {
      body: { code },
    }),
  );
}

export async function fetchBackupCodesCount() {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/shared/auth/totp/backup-codes/count"),
  );
}

export async function regenerateBackupCodes(code: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/shared/auth/totp/backup-codes/regenerate", {
      body: { code },
    }),
  );
}
