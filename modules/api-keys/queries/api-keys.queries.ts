import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";
import type { Permission } from "@/shared/utils/permissions";

export type ApiKey = components["schemas"]["APIKeyResponse"];
export type ApiKeyCreated = components["schemas"]["APIKeyCreatedResponse"];

export interface CreateApiKeyInput {
  name: string;
  scopes?: Permission[];
  expires_at?: string | null;
}

export async function fetchApiKeys() {
  return unwrapApiResult(await apiClient.GET("/api/v1/shared/api-keys"));
}

export async function createApiKey(input: CreateApiKeyInput) {
  return unwrapApiResult(
    await apiClient.POST("/api/v1/shared/api-keys", {
      body: input,
    }),
  );
}

export async function deleteApiKey(id: string) {
  return unwrapApiResult(
    await apiClient.DELETE("/api/v1/shared/api-keys/{key_id}", {
      params: { path: { key_id: id } },
    }),
  );
}
