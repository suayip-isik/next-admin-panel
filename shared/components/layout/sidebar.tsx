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
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useState } from "react";

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      key: "dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
    },
    {
      key: "users",
      href: "/users",
      icon: <Users className="h-4 w-4 shrink-0" />,
    },
    {
      key: "roles",
      href: "/roles",
      icon: <Shield className="h-4 w-4 shrink-0" />,
    },
    {
      key: "auditLogs",
      href: "/audit-logs",
      icon: <ScrollText className="h-4 w-4 shrink-0" />,
    },
    {
      key: "apiKeys",
      href: "/api-keys",
      icon: <Key className="h-4 w-4 shrink-0" />,
    },
    {
      key: "notifications",
      href: "/notifications",
      icon: <Bell className="h-4 w-4 shrink-0" />,
    },
  ];

  const profileItems: NavItem[] = [
    {
      key: "profile",
      href: "/profile",
      icon: <User className="h-4 w-4 shrink-0" />,
    },
    {
      key: "security",
      href: "/profile/security",
      icon: <Lock className="h-4 w-4 shrink-0" />,
    },
  ];

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
            Admin Panel
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
            <SidebarItem
              key={item.key}
              href={item.href}
              icon={item.icon}
              label={t(item.key as Parameters<typeof t>[0])}
              isActive={pathname.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="my-2 mx-2 border-t" />

        <nav className="space-y-1 px-2">
          {profileItems.map((item) => (
            <SidebarItem
              key={item.key}
              href={item.href}
              icon={item.icon}
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

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  collapsed: boolean;
}

function SidebarItem({
  href,
  icon,
  label,
  isActive,
  collapsed,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
