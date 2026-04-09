import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";

export type UserProfile = components["schemas"]["UserResponse"];

export interface UpdateProfileInput {
  full_name?: string | null;
  username?: string | null;
  email?: string;
}

export async function fetchProfile() {
  return unwrapApiResult(await apiClient.GET("/api/v1/users/me"));
}

export async function updateProfile(input: UpdateProfileInput) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/users/me", {
      body: input,
    }),
  );
}

export async function changePassword(newPassword: string) {
  return unwrapApiResult(
    await apiClient.PATCH("/api/v1/users/me", {
      body: { password: newPassword },
    }),
  );
}

export async function setupTotp() {
  return unwrapApiResult(await apiClient.POST("/api/v1/auth/totp/setup"));
}

export async function verifyTotp(code: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/auth/totp/verify", {
      body: { code },
    }),
  );
}

export async function disableTotp(code: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/auth/totp/disable", {
      body: { code },
    }),
  );
}

export async function fetchBackupCodesCount() {
  return unwrapApiResult(
    await apiClient.GET("/api/v1/auth/totp/backup-codes/count"),
  );
}

export async function regenerateBackupCodes(code: string) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/auth/totp/backup-codes/regenerate", {
      body: { code },
    }),
  );
}
