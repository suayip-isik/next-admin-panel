import { apiClient } from "@/lib/api-client";
import type { components } from "@/types/api.generated";

export type ApiKey = components["schemas"]["APIKeyResponse"];
export type ApiKeyCreated = components["schemas"]["APIKeyCreatedResponse"];

export interface CreateApiKeyInput {
  name: string;
  scopes?: string[];
  expires_at?: string | null;
}

export async function fetchApiKeys() {
  const { data, error } = await apiClient.GET("/api/v1/api-keys");
  if (error) throw error;
  return data;
}

export async function createApiKey(input: CreateApiKeyInput) {
  const { data, error } = await apiClient.POST("/api/v1/api-keys", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function deleteApiKey(id: string) {
  const { data, error } = await apiClient.DELETE("/api/v1/api-keys/{key_id}", {
    params: { path: { key_id: id } },
  });
  if (error) throw error;
  return data;
}
