import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireNamedPageAccess } from "@/lib/server-auth";
import { PageHeader } from "@/shared/components/page-header";
import { NotificationsList } from "@/modules/notifications/components/notifications-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notifications");
  return { title: t("title") };
}

export default async function NotificationsPage() {
  await requireNamedPageAccess("notifications");
  const t = await getTranslations("notifications");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <NotificationsList />
    </div>
  );
}
