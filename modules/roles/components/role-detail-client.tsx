"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Shield } from "lucide-react";
import { fetchRole } from "@/modules/roles/queries/roles.queries";
import { PageHeader } from "@/shared/components/page-header";
import { ActionGuard } from "@/shared/components/auth/action-guard";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PERMISSION_LABELS } from "@/shared/utils/permissions";
import { RoleDescriptionDialog } from "./role-description-dialog";
import { RolePermissionsDialog } from "./role-permissions-dialog";

interface RoleDetailClientProps {
  id: string;
}

export function RoleDetailClient({ id }: RoleDetailClientProps) {
  const t = useTranslations("roles");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  const {
    data: role,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["roles", id],
    queryFn: () => fetchRole(id),
    retry: false,
  });

  if (error) notFound();

  if (isLoading || !role) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const grouped = Object.entries(
    (role.permissions ?? []).reduce<Record<string, string[]>>((acc, perm) => {
      const group = perm.split(".")[0] ?? perm;
      (acc[group] ??= []).push(perm);
      return acc;
    }, {}),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={role.name}
          subtitle={role.description ?? t("subtitle")}
        />
        <Badge
          variant={role.is_system ? "secondary" : "outline"}
          className="ml-auto"
        >
          {role.is_system ? t("systemRole") : t("customRole")}
        </Badge>
        <ActionGuard
          all={["roles.update.description"]}
          loadingFallback={
            <Button variant="outline" disabled>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Description
            </Button>
          }
        >
          <Button variant="outline" onClick={() => setDescriptionOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Description
          </Button>
        </ActionGuard>
        <ActionGuard
          all={["roles.update.permissions"]}
          loadingFallback={
            <Button variant="outline" disabled>
              <Shield className="mr-2 h-4 w-4" />
              Edit Permissions
            </Button>
          }
        >
          <Button variant="outline" onClick={() => setPermissionsOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Edit Permissions
          </Button>
        </ActionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("columns.name")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {t("columns.name")}
              </p>
              <p className="font-mono font-medium">{role.name}</p>
            </div>
            {role.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("columns.description")}
                </p>
                <p className="text-sm">{role.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("columns.permissions")}
              <Badge variant="outline" className="ml-auto text-xs">
                {t("permissionsCount", {
                  count: role.permissions?.length ?? 0,
                })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {grouped.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              grouped.map(([group, perms], i) => (
                <div key={group}>
                  {i > 0 && <Separator className="mb-4" />}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 capitalize">
                    {group}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((perm) => (
                      <Badge
                        key={perm}
                        variant="secondary"
                        className="text-xs font-mono"
                      >
                        {PERMISSION_LABELS[
                          perm as keyof typeof PERMISSION_LABELS
                        ] ?? perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <RoleDescriptionDialog
        open={descriptionOpen}
        onOpenChange={setDescriptionOpen}
        role={role}
      />
      <RolePermissionsDialog
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
        role={role}
      />
    </div>
  );
}
