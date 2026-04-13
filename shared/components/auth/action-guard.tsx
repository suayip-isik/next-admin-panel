"use client";

import type { ReactNode } from "react";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import type { PermissionCheck } from "@/shared/utils/permissions";

interface ActionGuardProps extends PermissionCheck {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function ActionGuard({
  all,
  any,
  children,
  fallback = null,
  loadingFallback = null,
}: ActionGuardProps) {
  const gate = usePermissionGate({ all, any });

  if (gate.isLoading) {
    return <>{loadingFallback}</>;
  }

  return gate.isAllowed ? <>{children}</> : <>{fallback}</>;
}
