"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
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
      router.push("/login");
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (
        apiErr?.code === "INVALID_TOKEN" ||
        apiErr?.code === "TOKEN_EXPIRED"
      ) {
        form.setError("root", { message: t("errors.invalidToken") });
      } else {
        toast.error(tErrors("network"));
      }
    } finally {
      setIsLoading(false);
    }
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
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
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
