import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type UserProfile = components["schemas"]["UserResponse"];

export interface UpdateProfileInput {
  full_name?: string | null;
  username?: string | null;
  email?: string;
}

export async function fetchProfile() {
  const { data, error } = await apiClient.GET("/api/v1/users/me");
  if (error) throw error;
  return data;
}

export async function updateProfile(input: UpdateProfileInput) {
  const { data, error } = await apiClient.PATCH("/api/v1/users/me", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function changePassword(newPassword: string) {
  const { data, error } = await apiClient.PATCH("/api/v1/users/me", {
    body: { password: newPassword },
  });
  if (error) throw error;
  return data;
}

export async function setupTotp() {
  const { data, error } = await apiClient.POST("/api/v1/auth/totp/setup");
  if (error) throw error;
  return data;
}

export async function verifyTotp(code: string) {
  const { data, error } = await apiClient.POST("/api/v1/auth/totp/verify", {
    body: { code },
  });
  if (error) throw error;
  return data;
}

export async function disableTotp(code: string) {
  const { data, error } = await apiClient.POST("/api/v1/auth/totp/disable", {
    body: { code },
  });
  if (error) throw error;
  return data;
}

export async function fetchBackupCodesCount() {
  const { data, error } = await apiClient.GET(
    "/api/v1/auth/totp/backup-codes/count",
  );
  if (error) throw error;
  return data;
}

export async function regenerateBackupCodes(code: string) {
  const { data, error } = await apiClient.POST(
    "/api/v1/auth/totp/backup-codes/regenerate",
    { body: { code } },
  );
  if (error) throw error;
  return data;
}
