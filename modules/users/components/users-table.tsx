"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  Eye,
} from "lucide-react";
import { DataTable } from "@/shared/components/data-table/data-table";
import { DataTablePagination } from "@/shared/components/data-table/data-table-pagination";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { getErrorMessage } from "@/lib/errors";
import {
  fetchUsers,
  activateUser,
  deactivateUser,
  deleteUser,
  type User,
} from "../queries/users.queries";
import { usersKeys } from "../users.keys";
import { RoleChangeDialog } from "./role-change-dialog";

export function UsersTable() {
  const t = useTranslations("users");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const debouncedSearch = useDebounce(search, 400);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialog, setDialog] = useState<
    "activate" | "deactivate" | "delete" | "role" | null
  >(null);

  const { data, isLoading } = useQuery({
    queryKey: usersKeys.list(page, debouncedSearch),
    queryFn: () =>
      fetchUsers({ page, size: 20, q: debouncedSearch || undefined }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: usersKeys.all });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateUser(id),
    onSuccess: () => {
      toast.success(t("successMessages.activated"));
      invalidate();
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          t("errorMessages.activateFailed") || tErrors("generic"),
        ),
      ),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      toast.success(t("successMessages.deactivated"));
      invalidate();
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          t("errorMessages.deactivateFailed") || tErrors("generic"),
        ),
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success(t("successMessages.deleted"));
      invalidate();
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          t("errorMessages.deleteFailed") || tErrors("generic"),
        ),
      ),
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: t("columns.user"),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">
            {row.original.full_name || row.original.email}
          </p>
          {row.original.full_name && (
            <p className="text-xs text-muted-foreground">
              {row.original.email}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: t("columns.role"),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.role.name}
        </Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("columns.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? t("filters.active") : t("filters.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "is_verified",
      header: t("columns.verified"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.is_verified ? "✓" : "—"}
        </span>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.username ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/users/${user.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t("actions.viewDetail")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.is_active ? (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setDialog("deactivate");
                  }}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  {t("actions.deactivate")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setDialog("activate");
                  }}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t("actions.activate")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setDialog("role");
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("actions.changeRole")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setSelectedUser(user);
                  setDialog("delete");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Input
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => {
          void setSearch(e.target.value || null);
          void setPage(1);
        }}
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={t("empty")}
      />

      {data && (
        <DataTablePagination
          page={page}
          totalPages={data.pages}
          total={data.total}
          onPageChange={(p) => void setPage(p)}
        />
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={dialog === "activate"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={t("dialogs.activate.title")}
        description={t("dialogs.activate.description", {
          name: selectedUser?.full_name ?? selectedUser?.email ?? "",
        })}
        confirmLabel={t("dialogs.activate.confirm")}
        loading={activateMutation.isPending}
        onConfirm={() => {
          if (selectedUser)
            activateMutation.mutate(selectedUser.id, {
              onSettled: () => setDialog(null),
            });
        }}
      />
      <ConfirmDialog
        open={dialog === "deactivate"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={t("dialogs.deactivate.title")}
        description={t("dialogs.deactivate.description", {
          name: selectedUser?.full_name ?? selectedUser?.email ?? "",
        })}
        confirmLabel={t("dialogs.deactivate.confirm")}
        variant="destructive"
        loading={deactivateMutation.isPending}
        onConfirm={() => {
          if (selectedUser)
            deactivateMutation.mutate(selectedUser.id, {
              onSettled: () => setDialog(null),
            });
        }}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={t("dialogs.delete.title")}
        description={t("dialogs.delete.description", {
          name: selectedUser?.full_name ?? selectedUser?.email ?? "",
        })}
        confirmLabel={t("dialogs.delete.confirm")}
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (selectedUser)
            deleteMutation.mutate(selectedUser.id, {
              onSettled: () => setDialog(null),
            });
        }}
      />
      {selectedUser && (
        <RoleChangeDialog
          open={dialog === "role"}
          onOpenChange={(open) => !open && setDialog(null)}
          user={selectedUser}
          onSuccess={() => {
            setDialog(null);
            invalidate();
          }}
        />
      )}
    </div>
  );
}
