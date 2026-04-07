"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { fetchUser } from "@/modules/users/queries/users.queries";
import { PageHeader } from "@/shared/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface UserDetailClientProps {
  id: string;
}

export function UserDetailClient({ id }: UserDetailClientProps) {
  const t = useTranslations("users.detail");
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUser(id),
    retry: false,
  });

  if (error) notFound();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={data.full_name ?? data.email} subtitle={data.email} />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("personalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("fullName")} value={data.full_name ?? "—"} />
            <Row label={t("username")} value={data.username ?? "—"} />
            <Row label="Email" value={data.email} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("accountStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row
              label="Role"
              value={
                <Badge variant="outline" className="capitalize">
                  {data.role.name}
                </Badge>
              }
            />
            <Row
              label={t("accountStatus")}
              value={
                <Badge variant={data.is_active ? "default" : "secondary"}>
                  {data.is_active ? "Active" : "Inactive"}
                </Badge>
              }
            />
            <Row
              label={t("emailVerified")}
              value={data.is_verified ? "Yes" : "No"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
