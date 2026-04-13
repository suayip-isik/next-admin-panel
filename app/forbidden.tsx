import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { APP_ROUTES } from "@/shared/lib/routes";

export default async function ForbiddenPage() {
  const t = await getTranslations("system.forbidden");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">{t("code")}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("description")}
        </p>
        <Link
          href={APP_ROUTES.dashboard}
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
