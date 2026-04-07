import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/shared/components/page-header";
import { ApiKeysList } from "@/modules/api-keys/components/api-keys-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("apiKeys");
  return { title: t("title") };
}

export default async function ApiKeysPage() {
  const t = await getTranslations("apiKeys");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ApiKeysList />
    </div>
  );
}
