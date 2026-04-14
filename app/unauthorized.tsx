import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { APP_ROUTES } from "@/shared/lib/routes";

export default async function UnauthorizedPage() {
  const t = await getTranslations("system.unauthorized");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t("code")}</h1>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
        <Link
          href={APP_ROUTES.dashboard}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
