"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  MoreHorizontal,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/shared/components/data-table/data-table";
import { DataTablePagination } from "@/shared/components/data-table/data-table-pagination";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { getUserDetailRoute } from "@/shared/lib/routes";
import {
  DEFAULT_QUERY_STALE_TIME_MS,
  DEFAULT_SEARCH_DEBOUNCE_MS,
  DEFAULT_TABLE_PAGE_SIZE,
} from "@/shared/lib/ui-config";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/errors";
import { fetchRoles } from "@/modules/roles/queries/roles.queries";
import { rolesKeys } from "@/modules/roles/roles.keys";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  fetchUsers,
  type User,
} from "../queries/users.queries";
import { usersKeys } from "../users.keys";
import { CreateAdminUserDialog } from "./create-admin-user-dialog";
import { RoleChangeDialog } from "./role-change-dialog";
import { UsersTableToolbar } from "./users-table-toolbar";

export function UsersTable() {
  const t = useTranslations("users");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();
  const readDetailGate = usePermissionGate({ all: ["users.read.basic"] });
  const createAdminGate = usePermissionGate({ all: ["users.create.admin"] });
  const activateGate = usePermissionGate({ all: ["users.activate"] });
  const deactivateGate = usePermissionGate({ all: ["users.deactivate"] });
  const deleteGate = usePermissionGate({ all: ["users.delete"] });
  const changeRoleGate = usePermissionGate({ all: ["users.update.role"] });

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [role, setRole] = useQueryState(
    "role",
    parseAsString.withDefault("all"),
  );
  const [status, setStatus] = useQueryState(
    "is_active",
    parseAsString.withDefault("all"),
  );
  const [verified, setVerified] = useQueryState(
    "is_verified",
    parseAsString.withDefault("all"),
  );
  const debouncedSearch = useDebounce(search, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [dialog, setDialog] = useState<
    "activate" | "deactivate" | "delete" | "role" | null
  >(null);

  const filters = {
    page,
    size: DEFAULT_TABLE_PAGE_SIZE,
    q: debouncedSearch || undefined,
    role: role === "all" ? undefined : role,
    is_active: status === "all" ? undefined : status === "true",
    is_verified: verified === "all" ? undefined : verified === "true",
  };

  const { data, isLoading } = useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => fetchUsers(filters),
  });
  const { data: roles } = useQuery({
    queryKey: rolesKeys.list(),
    queryFn: fetchRoles,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
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
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>{row.original.is_verified ? "✓" : "—"}</div>
          {row.original.has_pending_email && (
            <div className="text-xs">{t("verification.pendingEmail")}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: t("detail.username"),
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
        const isActionLoading =
          readDetailGate.isLoading ||
          activateGate.isLoading ||
          deactivateGate.isLoading ||
          deleteGate.isLoading ||
          changeRoleGate.isLoading;
        const hasActions =
          readDetailGate.isAllowed ||
          activateGate.isAllowed ||
          deactivateGate.isAllowed ||
          deleteGate.isAllowed ||
          changeRoleGate.isAllowed;

        if (isActionLoading) {
          return (
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        if (!hasActions) {
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
                <DropdownMenuItem
                  onClick={() => router.push(getUserDetailRoute(user.id))}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("actions.viewDetail")}
                </DropdownMenuItem>
              )}
              {readDetailGate.isAllowed &&
                (activateGate.isAllowed ||
                  deactivateGate.isAllowed ||
                  deleteGate.isAllowed ||
                  changeRoleGate.isAllowed) && <DropdownMenuSeparator />}
              {user.is_active
                ? deactivateGate.isAllowed && (
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setDialog("deactivate");
                      }}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      {t("actions.deactivate")}
                    </DropdownMenuItem>
                  )
                : activateGate.isAllowed && (
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
              {changeRoleGate.isAllowed && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setDialog("role");
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {t("actions.changeRole")}
                </DropdownMenuItem>
              )}
              {deleteGate.isAllowed && (
                <>
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
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const roleOptions = (roles ?? []).map((currentRole) => currentRole.name);

  return (
    <div className="space-y-4">
      <UsersTableToolbar
        searchPlaceholder={t("searchPlaceholder")}
        rolePlaceholder={t("filters.allRoles")}
        statusPlaceholder={t("filters.allStatuses")}
        verificationPlaceholder={t("filters.allVerification")}
        createLabel={t("createAdmin")}
        activeLabel={t("filters.active")}
        inactiveLabel={t("filters.inactive")}
        verifiedLabel={t("filters.verified")}
        unverifiedLabel={t("filters.unverified")}
        search={search}
        role={role}
        status={status}
        verified={verified}
        roleOptions={roleOptions}
        canCreate={createAdminGate.isAllowed || createAdminGate.isLoading}
        createLoading={createAdminGate.isLoading}
        onSearchChange={(value) => {
          void setSearch(value || null);
          void setPage(1);
        }}
        onRoleChange={(value) => {
          void setRole(value === "all" ? null : value);
          void setPage(1);
        }}
        onStatusChange={(value) => {
          void setStatus(value === "all" ? null : value);
          void setPage(1);
        }}
        onVerifiedChange={(value) => {
          void setVerified(value === "all" ? null : value);
          void setPage(1);
        }}
        onCreate={() => setCreateOpen(true)}
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
          onPageChange={(nextPage) => void setPage(nextPage)}
        />
      )}

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
          key={selectedUser.id}
          open={dialog === "role"}
          onOpenChange={(open) => !open && setDialog(null)}
          user={selectedUser}
          onSuccess={() => {
            setDialog(null);
            invalidate();
          }}
        />
      )}
      {createAdminGate.isAllowed && (
        <CreateAdminUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
