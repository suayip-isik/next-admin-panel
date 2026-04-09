"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { apiClient } from "@/lib/api-client";

export function VerifyEmailClient() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verificationQuery = useQuery({
    queryKey: ["auth", "verify-email", token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      const { error } = await apiClient.POST("/api/v1/auth/verify-email", {
        body: { token: token ?? "" },
      });

      if (error) {
        throw error;
      }

      return true;
    },
  });

  useEffect(() => {
    if (!verificationQuery.isSuccess) {
      return;
    }

    const redirectTimer = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(redirectTimer);
  }, [router, verificationQuery.isSuccess]);

  const status = !token
    ? "error"
    : verificationQuery.isSuccess
      ? "success"
      : verificationQuery.isError
        ? "error"
        : "loading";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === "loading" && (
          <p className="text-sm text-muted-foreground">{t("verifying")}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-600">{t("successMessage")}</p>
        )}
        {status === "error" && (
          <>
            <p className="text-sm text-destructive">{t("errorMessage")}</p>
            <Link
              href={"/login"}
              className="text-sm text-primary underline underline-offset-4"
            >
              {t("backToLogin")}
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
