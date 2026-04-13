import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireNamedPageAccess } from "@/lib/server-auth";
import { PageHeader } from "@/shared/components/page-header";
import { UsersTable } from "@/modules/users/components/users-table";
import { UserStatsCards } from "@/modules/users/components/user-stats-cards";
import { Suspense } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users");
  return { title: t("title") };
}

export default async function UsersPage() {
  await requireNamedPageAccess("usersList");
  const t = await getTranslations("users");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        }
      >
        <UserStatsCards />
      </Suspense>
      <UsersTable />
    </div>
  );
}
