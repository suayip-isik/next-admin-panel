"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { DataTable } from "@/shared/components/data-table/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { formatDateTime, formatRelativeTime } from "@/shared/utils/date";
import { PERMISSIONS, type Permission } from "@/shared/utils/permissions";
import { getErrorMessage } from "@/lib/errors";
import {
  fetchApiKeys,
  createApiKey,
  deleteApiKey,
  type ApiKey,
  type ApiKeyCreated,
} from "../queries/api-keys.queries";
import { apiKeysKeys } from "../api-keys.keys";

const createSchema = z.object({
  name: z.string().min(1),
  expires_at: z.string().optional(),
  scopes_raw: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

function isPermission(value: string): value is Permission {
  return PERMISSIONS.includes(value as Permission);
}

export function ApiKeysList() {
  const t = useTranslations("apiKeys");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const createApiKeyGate = usePermissionGate({ all: ["api_keys.create"] });
  const revokeApiKeyGate = usePermissionGate({ all: ["api_keys.revoke"] });

  const [createOpen, setCreateOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: apiKeysKeys.list(),
    queryFn: fetchApiKeys,
  });

  const form = useForm<CreateFormValues>({
    resolver: standardSchemaResolver(createSchema),
    defaultValues: { name: "", expires_at: "", scopes_raw: "" },
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateFormValues) =>
      createApiKey({
        name: values.name,
        expires_at: values.expires_at || null,
        scopes: values.scopes_raw
          ? values.scopes_raw
              .split(",")
              .map((s) => s.trim())
              .filter(isPermission)
              .filter(Boolean)
          : [],
      }),
    onSuccess: (created) => {
      toast.success(t("successMessages.created"));
      void queryClient.invalidateQueries({ queryKey: apiKeysKeys.all });
      form.reset();
      setCreateOpen(false);
      if (created) setRevealedKey(created);
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: () => {
      toast.success(t("successMessages.deleted"));
      void queryClient.invalidateQueries({ queryKey: apiKeysKeys.all });
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  function handleCopy(key: string) {
    void navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const columns: ColumnDef<ApiKey>[] = [
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "key_prefix",
      header: t("columns.prefix"),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.key_prefix}…
        </span>
      ),
    },
    {
      accessorKey: "scopes",
      header: t("columns.scopes"),
      cell: ({ row }) => {
        const scopes = row.original.scopes;
        if (!scopes?.length)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {scopes.map((s) => (
              <Badge key={s} variant="outline" className="text-xs font-mono">
                {s}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "expires_at",
      header: t("columns.expires"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.expires_at
            ? formatDateTime(row.original.expires_at)
            : t("never")}
        </span>
      ),
    },
    {
      accessorKey: "last_used_at",
      header: t("columns.lastUsed"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.last_used_at
            ? formatRelativeTime(row.original.last_used_at)
            : t("neverUsed")}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("columns.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? tCommon("active") : tCommon("disabled")}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        revokeApiKeyGate.isAllowed ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {(createApiKeyGate.isAllowed || createApiKeyGate.isLoading) && (
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={createApiKeyGate.isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("createKey")}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyMessage={t("empty")}
      />

      {/* Create dialog */}
      <Dialog
        open={createApiKeyGate.isAllowed && createOpen}
        onOpenChange={setCreateOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("form.title")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scopes_raw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.scopes")}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({tCommon("optional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="read, write" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t("form.scopesHint")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.expiresAt")}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({tCommon("optional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t("form.expiresAtHint")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateOpen(false);
                    form.reset();
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending
                    ? t("form.submitting")
                    : t("form.submit")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Key revealed dialog — shown only once after creation */}
      <Dialog
        open={!!revealedKey}
        onOpenChange={(open) => {
          if (!open) {
            setRevealedKey(null);
            setCopied(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("createdDialog.title")}</DialogTitle>
            <DialogDescription className="text-amber-600 dark:text-amber-400 font-medium">
              {t("createdDialog.warning")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
            <code className="flex-1 font-mono text-xs break-all">
              {revealedKey?.key}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => revealedKey && handleCopy(revealedKey.key)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setRevealedKey(null);
                setCopied(false);
              }}
            >
              {tCommon("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      {revokeApiKeyGate.isAllowed && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={t("deleteDialog.title")}
          description={t("deleteDialog.description", {
            name: deleteTarget?.name ?? "",
          })}
          confirmLabel={t("deleteDialog.confirm")}
          cancelLabel={tCommon("cancel")}
          variant="destructive"
          loading={deleteMutation.isPending}
          onConfirm={() =>
            deleteTarget && deleteMutation.mutate(deleteTarget.id)
          }
        />
      )}
    </div>
  );
}
