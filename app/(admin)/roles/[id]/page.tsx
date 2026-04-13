import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireNamedPageAccess } from "@/lib/server-auth";
import { RoleDetailClient } from "@/modules/roles/components/role-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("roles");
  return { title: `${t("title")} — ${id.slice(0, 8)}` };
}

export default async function RoleDetailPage({ params }: Props) {
  await requireNamedPageAccess("roleDetail");
  const { id } = await params;
  return <RoleDetailClient id={id} />;
}
