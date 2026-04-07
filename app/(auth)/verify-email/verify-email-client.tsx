"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
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
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    apiClient
      .POST("/api/v1/auth/verify-email", { body: { token } })
      .then(({ error }) => {
        if (!error) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token, router]);

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
