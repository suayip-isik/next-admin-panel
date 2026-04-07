"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  fetchBackupCodesCount,
  regenerateBackupCodes,
} from "../queries/profile.queries";

const codeSchema = z.object({
  code: z.string().min(6).max(6),
});

type CodeFormValues = { code: string };

export function BackupCodesSection() {
  const t = useTranslations("profile.security.backupCodes");
  const tTotp = useTranslations("profile.security.totp");
  const tProfile = useTranslations("profile");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["totp", "backup-codes", "count"],
    queryFn: fetchBackupCodesCount,
    retry: false,
  });

  const form = useForm<CodeFormValues>({
    resolver: standardSchemaResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const regenerateMutation = useMutation({
    mutationFn: (values: CodeFormValues) => regenerateBackupCodes(values.code),
    onSuccess: (result) => {
      toast.success(tProfile("successMessages.backupCodesRegenerated"));
      queryClient.invalidateQueries({
        queryKey: ["totp", "backup-codes", "count"],
      });
      setRegenerateOpen(false);
      form.reset();
      if (result?.backup_codes) {
        setNewCodes(result.backup_codes);
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Only render when TOTP is enabled
  if (isError || (!isLoading && !data)) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm">
            {t("remaining", { count: data?.count ?? 0 })}
          </p>
          <Button variant="outline" onClick={() => setRegenerateOpen(true)}>
            {t("regenerate")}
          </Button>
        </CardContent>
      </Card>

      {/* Regenerate: requires current TOTP code */}
      <Dialog
        open={regenerateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRegenerateOpen(false);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("regenerate")}</DialogTitle>
            <DialogDescription className="text-amber-600 dark:text-amber-400">
              {t("regenerateWarning")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => regenerateMutation.mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tTotp("code")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tTotp("codePlaceholder")}
                        inputMode="numeric"
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRegenerateOpen(false);
                    form.reset();
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={regenerateMutation.isPending}
                >
                  {t("confirm")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New codes dialog — shown once after regeneration */}
      <Dialog
        open={!!newCodes}
        onOpenChange={(open) => {
          if (!open) setNewCodes(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {newCodes?.map((code) => (
              <code
                key={code}
                className="rounded border bg-muted px-2 py-1 text-center font-mono text-xs"
              >
                {code}
              </code>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setNewCodes(null)}>
              {tCommon("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
