"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/auth/me");
      if (error) throw new Error("Unauthorized");
      return data;
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
    role: (data as { role?: { name?: string } }).role?.name ?? "user",
  };
}
