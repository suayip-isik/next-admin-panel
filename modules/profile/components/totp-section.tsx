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
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  setupTotp,
  verifyTotp,
  disableTotp,
  fetchBackupCodesCount,
} from "../queries/profile.queries";

type SetupState =
  | { step: "idle" }
  | { step: "scanning"; qrCode: string; secret: string }
  | { step: "backup_codes"; codes: string[] };

const codeSchema = z.object({
  code: z.string().min(6).max(6),
});

type CodeFormValues = { code: string };

interface TotpSectionProps {
  onStatusChange?: () => void;
}

export function TotpSection({ onStatusChange }: TotpSectionProps) {
  const t = useTranslations("profile.security.totp");
  const tProfile = useTranslations("profile");
  const tBackupCodes = useTranslations("profile.security.backupCodes");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [setupState, setSetupState] = useState<SetupState>({ step: "idle" });
  const [disableOpen, setDisableOpen] = useState(false);

  const {
    data: backupCount,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["totp", "backup-codes", "count"],
    queryFn: fetchBackupCodesCount,
    retry: false,
  });

  const totpEnabled = !isError && backupCount !== undefined;

  const verifyForm = useForm<CodeFormValues>({
    resolver: standardSchemaResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const disableForm = useForm<CodeFormValues>({
    resolver: standardSchemaResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const setupMutation = useMutation({
    mutationFn: setupTotp,
    onSuccess: (data) => {
      if (data) {
        setSetupState({
          step: "scanning",
          qrCode: data.qr_code,
          secret: data.secret,
        });
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const verifyMutation = useMutation({
    mutationFn: (values: CodeFormValues) => verifyTotp(values.code),
    onSuccess: (data) => {
      toast.success(tProfile("successMessages.totpEnabled"));
      queryClient.invalidateQueries({
        queryKey: ["totp", "backup-codes", "count"],
      });
      if (data?.backup_codes) {
        setSetupState({ step: "backup_codes", codes: data.backup_codes });
      } else {
        setSetupState({ step: "idle" });
      }
      onStatusChange?.();
      verifyForm.reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disableMutation = useMutation({
    mutationFn: (values: CodeFormValues) => disableTotp(values.code),
    onSuccess: () => {
      toast.success(tProfile("successMessages.totpDisabled"));
      queryClient.invalidateQueries({
        queryKey: ["totp", "backup-codes", "count"],
      });
      setDisableOpen(false);
      disableForm.reset();
      onStatusChange?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{t("title")}</CardTitle>
            <Badge variant={totpEnabled ? "default" : "secondary"}>
              {totpEnabled ? tCommon("enabled") : tCommon("disabled")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {totpEnabled ? t("enabled") : t("disabled")}
          </p>
        </CardHeader>
        <CardContent>
          {totpEnabled ? (
            <Button variant="destructive" onClick={() => setDisableOpen(true)}>
              {t("disable")}
            </Button>
          ) : (
            <Button
              onClick={() => setupMutation.mutate()}
              disabled={setupMutation.isPending}
            >
              {t("enable")}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Setup: QR scan + code verification */}
      <Dialog
        open={setupState.step === "scanning"}
        onOpenChange={(open) => {
          if (!open) {
            setSetupState({ step: "idle" });
            verifyForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("setupTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("setupStep1")}</p>
            {setupState.step === "scanning" && (
              <>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupState.qrCode}
                    alt="TOTP QR Code"
                    className="h-48 w-48 rounded-md border"
                  />
                </div>
                <div className="rounded-md border bg-muted px-3 py-2 text-center">
                  <code className="font-mono text-xs break-all">
                    {setupState.secret}
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("setupStep2")}
                </p>
                <Form {...verifyForm}>
                  <form
                    onSubmit={verifyForm.handleSubmit((v) =>
                      verifyMutation.mutate(v),
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={verifyForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("code")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("codePlaceholder")}
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
                          setSetupState({ step: "idle" });
                          verifyForm.reset();
                        }}
                      >
                        {tCommon("cancel")}
                      </Button>
                      <Button type="submit" disabled={verifyMutation.isPending}>
                        {t("verifySubmit")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup codes shown once after enabling */}
      <Dialog
        open={setupState.step === "backup_codes"}
        onOpenChange={(open) => {
          if (!open) setSetupState({ step: "idle" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("setupTitle")}</DialogTitle>
            <DialogDescription className="text-amber-600 dark:text-amber-400 font-medium">
              {tBackupCodes("regenerateWarning")}
            </DialogDescription>
          </DialogHeader>
          {setupState.step === "backup_codes" && (
            <div className="grid grid-cols-2 gap-2">
              {setupState.codes.map((code) => (
                <code
                  key={code}
                  className="rounded border bg-muted px-2 py-1 text-center font-mono text-xs"
                >
                  {code}
                </code>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setSetupState({ step: "idle" })}>
              {tCommon("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable TOTP: requires current code */}
      <Dialog
        open={disableOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDisableOpen(false);
            disableForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("disableTitle")}</DialogTitle>
            <DialogDescription>{t("disableDescription")}</DialogDescription>
          </DialogHeader>
          <Form {...disableForm}>
            <form
              onSubmit={disableForm.handleSubmit((v) =>
                disableMutation.mutate(v),
              )}
              className="space-y-4"
            >
              <FormField
                control={disableForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("code")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("codePlaceholder")}
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
                    setDisableOpen(false);
                    disableForm.reset();
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={disableMutation.isPending}
                >
                  {t("disableSubmit")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
