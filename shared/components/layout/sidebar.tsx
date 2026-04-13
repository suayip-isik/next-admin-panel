"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Shield,
  ScrollText,
  Key,
  Bell,
  User,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAppShortName } from "@/lib/env";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import type { PermissionCheck } from "@/shared/utils/permissions";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useState } from "react";

interface NavItem {
  key: string;
  href: string;
  icon: typeof LayoutDashboard;
  access?: PermissionCheck;
}

const navItems: NavItem[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    access: { any: ["users.read.stats"] },
  },
  {
    key: "users",
    href: "/users",
    icon: Users,
    access: { all: ["users.list"] },
  },
  {
    key: "roles",
    href: "/roles",
    icon: Shield,
    access: { all: ["roles.list"] },
  },
  {
    key: "auditLogs",
    href: "/audit-logs",
    icon: ScrollText,
    access: { all: ["audit_logs.list"] },
  },
  {
    key: "apiKeys",
    href: "/api-keys",
    icon: Key,
    access: { all: ["api_keys.list"] },
  },
  {
    key: "notifications",
    href: "/notifications",
    icon: Bell,
    access: { all: ["notifications.list"] },
  },
];

const profileItems: NavItem[] = [
  {
    key: "profile",
    href: "/profile",
    icon: User,
    access: { all: ["profile.read.self"] },
  },
  {
    key: "security",
    href: "/profile/security",
    icon: Lock,
    access: { all: ["profile.read.self"] },
  },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <span className="font-semibold text-sidebar-foreground truncate">
            {getAppShortName()}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.key}
              item={item}
              label={t(item.key as Parameters<typeof t>[0])}
              isActive={pathname.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="my-2 mx-2 border-t" />

        <nav className="space-y-1 px-2">
          {profileItems.map((item) => (
            <SidebarNavItem
              key={item.key}
              item={item}
              label={t(item.key as Parameters<typeof t>[0])}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}

interface SidebarNavItemProps {
  item: NavItem;
  label: string;
  isActive: boolean;
  collapsed: boolean;
}

function SidebarNavItem({
  item,
  label,
  isActive,
  collapsed,
}: SidebarNavItemProps) {
  const gate = usePermissionGate(item.access);

  if (gate.isLoading) {
    const Icon = item.icon;

    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-2 text-sm opacity-50",
          collapsed && "justify-center px-2",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
    );
  }

  if (!gate.isAllowed) {
    return null;
  }

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
