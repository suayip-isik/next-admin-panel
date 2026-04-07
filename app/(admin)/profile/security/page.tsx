import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/shared/components/page-header";
import { ChangePasswordForm } from "@/modules/profile/components/change-password-form";
import { TotpSection } from "@/modules/profile/components/totp-section";
import { BackupCodesSection } from "@/modules/profile/components/backup-codes-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile.security");
  return { title: t("title") };
}

export default async function SecurityPage() {
  const t = await getTranslations("profile.security");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="max-w-lg space-y-6">
        <ChangePasswordForm />
        <TotpSection />
        <BackupCodesSection />
      </div>
    </div>
  );
}
