import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DeletedUsersPageClient } from "@/modules/users/components/deleted-users-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users");
  return { title: t("deletedUsers.title") };
}

export default async function DeletedUsersPage() {
  return <DeletedUsersPageClient />;
}
