import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { AuthzSnapshot } from "@/shared/lib/authz";
import { AUTHZ_SNAPSHOT_QUERY_KEY } from "@/shared/lib/authz";

interface AuthzHydrationProps {
  snapshot: AuthzSnapshot;
  children: React.ReactNode;
}

export function AuthzHydration({
  snapshot,
  children,
}: Readonly<AuthzHydrationProps>) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(AUTHZ_SNAPSHOT_QUERY_KEY, snapshot);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
