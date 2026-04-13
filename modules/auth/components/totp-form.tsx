"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { APP_ROUTES } from "@/shared/lib/routes";
import {
  createTotpChallengeSchema,
  type TOTPChallengeInput,
} from "../schemas/auth.schemas";
import { totpChallengeMutation } from "../queries/auth.queries";
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

export function TOTPForm() {
  const t = useTranslations("auth.totp");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [partialToken, setPartialToken] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("partial_token");
    if (!token) {
      router.replace(APP_ROUTES.login);
      return;
    }
    setPartialToken(token);
  }, [router]);

  const totpChallengeSchema = useMemo(
    () => createTotpChallengeSchema(tValidation),
    [tValidation],
  );

  const form = useForm<TOTPChallengeInput>({
    resolver: standardSchemaResolver(totpChallengeSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: TOTPChallengeInput) {
    if (!partialToken) {
      router.replace(APP_ROUTES.login);
      return;
    }

    setIsLoading(true);
    try {
      await totpChallengeMutation({
        partial_token: partialToken,
        code: values.code,
      });
      sessionStorage.removeItem("partial_token");
      // Full page navigation ensures cookies are included in all subsequent requests
      window.location.replace(APP_ROUTES.home);
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      if (apiErr?.code === "INVALID_SESSION") {
        sessionStorage.removeItem("partial_token");
        form.setError("code", { message: t("errors.invalidSession") });
      } else if (apiErr?.code) {
        form.setError("code", { message: t("errors.invalidCode") });
      } else {
        toast.error(tErrors("network"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!partialToken) {
    return null;
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("code")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("codePlaceholder")}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("submitting") : t("submit")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link
                href={APP_ROUTES.login}
                className="hover:text-foreground underline underline-offset-4"
              >
                {t("backToLogin")}
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
