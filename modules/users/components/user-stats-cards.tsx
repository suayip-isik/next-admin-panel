"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { fetchUserStats } from "@/modules/users/queries/users.queries";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { usersKeys } from "@/modules/users/users.keys";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Users, UserCheck, UserX } from "lucide-react";

export function UserStatsCards() {
  const t = useTranslations("dashboard.stats");
  const gate = usePermissionGate({ all: ["users.read.stats"] });
  const { data, isLoading } = useQuery({
    queryKey: usersKeys.stats(),
    queryFn: fetchUserStats,
    enabled: gate.status === "allowed",
  });

  if (gate.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!gate.isAllowed) {
    return null;
  }

  const stats = [
    {
      label: t("totalUsers"),
      value: data?.total ?? 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: t("activeUsers"),
      value: data?.active ?? 0,
      icon: <UserCheck className="h-4 w-4 text-green-500" />,
    },
    {
      label: t("inactiveUsers"),
      value: data?.inactive ?? 0,
      icon: <UserX className="h-4 w-4 text-destructive" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
