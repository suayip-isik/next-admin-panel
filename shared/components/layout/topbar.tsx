"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { LocaleSwitcher } from "@/shared/components/locale-switcher";
import { NotificationBell } from "@/shared/components/layout/notification-bell";
import {
  AUTH_ME_QUERY_KEY,
  useSessionMeta,
} from "@/shared/hooks/use-session-meta";
import { logoutMutation } from "@/modules/auth/queries/auth.queries";

export function Topbar() {
  const t = useTranslations("nav");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionMeta = useSessionMeta();

  async function handleSignOut() {
    try {
      await logoutMutation();
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error(tErrors("generic"));
    }
  }

  const initials = sessionMeta?.email
    ? sessionMeta.email.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <div className="flex-1" />

      <NotificationBell />

      <LocaleSwitcher />
      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="font-medium text-sm truncate">
              {sessionMeta?.email ?? "Admin"}
            </p>
            {sessionMeta?.role && (
              <p className="text-xs text-muted-foreground capitalize">
                {sessionMeta.role}
              </p>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
