"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import {
  createResetPasswordSchema,
  type ResetPasswordInput,
} from "../schemas/auth.schemas";
import { resetPasswordMutation } from "../queries/auth.queries";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(tValidation),
    [tValidation],
  );

  const form = useForm<ResetPasswordInput>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: { token, new_password: "", confirm_password: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setIsLoading(true);
    try {
      await resetPasswordMutation(values);
      toast.success(t("successMessage"));
      setIsSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      if (
        apiErr?.code === "INVALID_TOKEN" ||
        apiErr?.code === "TOKEN_EXPIRED" ||
        apiErr?.code === "TOKEN_USED"
      ) {
        form.setError("root", { message: t("errors.invalidToken") });
      } else if (apiErr?.message) {
        form.setError("root", { message: apiErr.message });
      } else {
        toast.error(tErrors("network"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-destructive">{t("errors.missingToken")}</p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href={APP_ROUTES.forgotPassword}>
                {t("requestNewLink")}
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push(APP_ROUTES.login)}
            >
              {t("backToLogin")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-green-600">{t("successMessage")}</p>
          <Button
            type="button"
            className="w-full"
            onClick={() => router.push(APP_ROUTES.login)}
          >
            {t("backToLogin")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="space-y-3">
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/forgot-password">{t("requestNewLink")}</Link>
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
