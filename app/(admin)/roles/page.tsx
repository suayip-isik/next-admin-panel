import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireNamedPageAccess } from "@/lib/server-auth";
import { PageHeader } from "@/shared/components/page-header";
import { RolesTableWithCreate } from "@/modules/roles/components/roles-table-with-create";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("roles");
  return { title: t("title") };
}

export default async function RolesPage() {
  await requireNamedPageAccess("rolesList");
  const t = await getTranslations("roles");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <RolesTableWithCreate />
    </div>
  );
}
