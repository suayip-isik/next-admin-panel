"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import type { components } from "@/types/api.generated";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
export type CurrentUser = components["schemas"]["UserResponse"] & {
  role:
    | components["schemas"]["RoleResponse"]
    | components["schemas"]["RoleInfo"];
};

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      return unwrapApiResult<CurrentUser>(
        await apiClient.GET("/api/v1/shared/me"),
      );
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export interface SessionMeta {
  id: string;
  email: string;
  role: string;
}

// Used by Sidebar/Topbar for UI display
export function useSessionMeta(): SessionMeta | null {
  const { data } = useCurrentUser();
  if (!data) return null;
  return {
    id: data.id,
    email: data.email,
    role: data.role?.name ?? "user",
  };
}
