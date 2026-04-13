"use client";

import { useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { unwrapApiResult } from "@/lib/errors";
import { getAvatarPresentation } from "@/shared/utils/avatar";
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
  fullName: string | null;
  role: string;
  avatarUrl: string | null;
  avatarSrc: string | null;
  avatarFallback: string;
}

export function mergeCurrentUserCache(
  queryClient: QueryClient,
  updatedUser: CurrentUser,
) {
  queryClient.setQueryData<CurrentUser>(AUTH_ME_QUERY_KEY, (currentUser) =>
    currentUser ? { ...currentUser, ...updatedUser } : updatedUser,
  );
}

// Used by Sidebar/Topbar for UI display
export function useSessionMeta(): SessionMeta | null {
  const { data, dataUpdatedAt } = useCurrentUser();
  if (!data) return null;
  const avatar = getAvatarPresentation({
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    revision: dataUpdatedAt,
  });

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name ?? null,
    role: data.role?.name ?? "app_user",
    avatarUrl: data.avatar_url ?? null,
    avatarSrc: avatar.src,
    avatarFallback: avatar.fallback,
  };
}
