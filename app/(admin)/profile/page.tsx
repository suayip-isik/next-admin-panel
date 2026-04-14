import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireNamedPageAccess } from "@/lib/server-auth";
import { PageHeader } from "@/shared/components/page-header";
import { ProfileAvatarSection } from "@/modules/profile/components/profile-avatar-section";
import { ProfileEmailForm } from "@/modules/profile/components/profile-email-form";
import { ProfileForm } from "@/modules/profile/components/profile-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("title") };
}

export default async function ProfilePage() {
  await requireNamedPageAccess("profile");
  const t = await getTranslations("profile");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="max-w-2xl space-y-6">
        <ProfileAvatarSection />
        <ProfileForm />
        <ProfileEmailForm />
      </div>
    </div>
  );
}
