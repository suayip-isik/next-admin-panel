import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserDetailClient } from "@/modules/users/components/user-detail-client";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("users.detail");
  return { title: `${t("title")} — ${id.slice(0, 8)}` };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <UserDetailClient id={id} />;
}
