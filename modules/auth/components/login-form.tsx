"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import { createLoginSchema, type LoginInput } from "../schemas/auth.schemas";
import { loginMutation } from "../queries/auth.queries";
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

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const router = useRouter(); // used for TOTP redirect
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = useMemo(
    () => createLoginSchema(tValidation),
    [tValidation],
  );

  const form = useForm<LoginInput>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setIsLoading(true);
    try {
      const result = await loginMutation(values);

      if (result.requires_totp) {
        sessionStorage.setItem("partial_token", result.partial_token);
        router.push(APP_ROUTES.totp);
        return;
      }

      // Full page navigation ensures cookies are included in all subsequent requests
      window.location.replace(APP_ROUTES.home);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      if (apiErr?.code === "INACTIVE_USER") {
        form.setError("root", { message: t("errors.accountInactive") });
      } else if (apiErr?.code) {
        form.setError("root", {
          message: apiErr.message ?? t("errors.invalidCredentials"),
        });
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t("password")}</FormLabel>
                    <Link
                      href={APP_ROUTES.forgotPassword}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      autoComplete="current-password"
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
