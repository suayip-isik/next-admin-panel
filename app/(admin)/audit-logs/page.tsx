import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireNamedPageAccess } from "@/lib/server-auth";
import { PageHeader } from "@/shared/components/page-header";
import { AuditLogsTable } from "@/modules/audit-logs/components/audit-logs-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auditLogs");
  return { title: t("title") };
}

export default async function AuditLogsPage() {
  await requireNamedPageAccess("auditLogs");
  const t = await getTranslations("auditLogs");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <AuditLogsTable />
    </div>
  );
}
