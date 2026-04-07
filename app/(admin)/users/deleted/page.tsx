"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { DataTable } from "@/shared/components/data-table/data-table";
import { DataTablePagination } from "@/shared/components/data-table/data-table-pagination";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { Input } from "@/shared/components/ui/input";
import {
  fetchDeletedUsers,
  restoreUser,
  type DeletedUser,
} from "@/modules/users/queries/users.queries";

export default function DeletedUsersPage() {
  const t = useTranslations("users");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedUser, setSelectedUser] = useState<DeletedUser | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["users", "deleted", page, debouncedSearch],
    queryFn: () =>
      fetchDeletedUsers({
        page,
        size: 20,
        search: debouncedSearch || undefined,
      }),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreUser(id),
    onSuccess: () => {
      toast.success(t("successMessages.restored"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setRestoreOpen(false);
    },
    onError: () => toast.error("Failed to restore user"),
  });

  const columns: ColumnDef<DeletedUser>[] = [
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
        <span className="text-sm capitalize">{row.original.role.name}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedUser(row.original);
            setRestoreOpen(true);
          }}
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          {t("actions.restore")}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("deletedUsers.title")}
        subtitle={t("deletedUsers.subtitle")}
      />
      <Input
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={t("deletedUsers.empty")}
      />
      {data && (
        <DataTablePagination
          page={page}
          totalPages={data.pages}
          total={data.total}
          onPageChange={setPage}
        />
      )}
      <ConfirmDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        title={t("dialogs.restore.title")}
        description={t("dialogs.restore.description", {
          name: selectedUser?.full_name ?? selectedUser?.email ?? "",
        })}
        confirmLabel={t("dialogs.restore.confirm")}
        loading={restoreMutation.isPending}
        onConfirm={() =>
          selectedUser && restoreMutation.mutate(selectedUser.id)
        }
      />
    </div>
  );
}
