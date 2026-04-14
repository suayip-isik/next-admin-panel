"use client";

import { useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  AUTH_ME_QUERY_KEY,
  AUTHZ_SNAPSHOT_QUERY_KEY,
  type AuthzSnapshot,
  type CurrentUser,
  resolveClientAuthzSnapshot,
} from "@/shared/lib/authz";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/lib/ui-config";
import { getAvatarPresentation } from "@/shared/utils/avatar";
export { AUTH_ME_QUERY_KEY };
export { AUTHZ_SNAPSHOT_QUERY_KEY };

export function useAuthzSnapshot() {
  return useQuery({
    queryKey: AUTHZ_SNAPSHOT_QUERY_KEY,
    queryFn: resolveClientAuthzSnapshot,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
    retry: false,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTHZ_SNAPSHOT_QUERY_KEY,
    queryFn: resolveClientAuthzSnapshot,
    select: (snapshot) => snapshot.user,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
    retry: false,
  });
}

export interface SessionMeta {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
  avatarUrl: string | null;
  avatarSrc: string | null;
  avatarFallback: string;
}

export function mergeCurrentUserCache(
  queryClient: QueryClient,
  updatedUser: CurrentUser,
) {
  queryClient.setQueryData<AuthzSnapshot>(
    AUTHZ_SNAPSHOT_QUERY_KEY,
    (currentSnapshot) => {
      if (!currentSnapshot) {
        return {
          user: updatedUser,
          permissions: [],
          state: "unavailable",
          source: "unavailable",
        };
      }

      return {
        ...currentSnapshot,
        user: {
          ...currentSnapshot.user,
          ...updatedUser,
          role: updatedUser.role ?? currentSnapshot.user.role,
        },
      };
    },
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
    role: data.role?.name ?? null,
    avatarUrl: data.avatar_url ?? null,
    avatarSrc: avatar.src,
    avatarFallback: avatar.fallback,
  };
}
