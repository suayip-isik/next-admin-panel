"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { getRoleDetailRoute } from "@/shared/lib/routes";
import { getErrorMessage } from "@/lib/errors";
import { fetchRoles, deleteRole, type Role } from "../queries/roles.queries";
import { rolesKeys } from "../roles.keys";

export function RolesTable() {
  const t = useTranslations("roles");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dialog, setDialog] = useState<"delete" | null>(null);
  const readDetailGate = usePermissionGate({ all: ["roles.read.detail"] });
  const deleteRoleGate = usePermissionGate({ all: ["roles.delete"] });

  const { data, isLoading } = useQuery({
    queryKey: rolesKeys.list(),
    queryFn: fetchRoles,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast.success(t("successMessages.deleted"));
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      closeDialog();
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  const closeDialog = () => {
    setDialog(null);
    setSelectedRole(null);
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{row.original.name}</span>
          <Badge
            variant={row.original.is_system ? "secondary" : "outline"}
            className="text-xs"
          >
            {row.original.is_system ? t("systemRole") : t("customRole")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: t("columns.description"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "permissions",
      header: t("columns.permissions"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {t("permissionsCount", {
            count: row.original.permissions?.length ?? 0,
          })}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original;
        if (readDetailGate.isLoading || deleteRoleGate.isLoading) {
          return (
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        if (
          !readDetailGate.isAllowed &&
          (!deleteRoleGate.isAllowed || role.is_system)
        ) {
          return null;
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {readDetailGate.isAllowed && (
                <DropdownMenuItem asChild>
                  <Link href={getRoleDetailRoute(role.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t("actions.viewDetail")}
                  </Link>
                </DropdownMenuItem>
              )}
              {!role.is_system && deleteRoleGate.isAllowed && (
                <>
                  {readDetailGate.isAllowed && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      setSelectedRole(role);
                      setDialog("delete");
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("actions.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyMessage={t("empty")}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", {
          name: selectedRole?.name ?? "",
        })}
        confirmLabel={t("deleteDialog.confirm")}
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => selectedRole && deleteMutation.mutate(selectedRole.id)}
      />
    </div>
  );
}
