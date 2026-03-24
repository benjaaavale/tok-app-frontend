"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
  FileText,
} from "lucide-react";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/conversations", label: "Mensajes", icon: MessageCircle, adminOnly: false },
  { href: "/calendar", label: "Agenda", icon: CalendarDays, adminOnly: false },
  { href: "/templates", label: "Plantillas", icon: FileText, adminOnly: true },
  { href: "/settings", label: "Ajustes", icon: Settings, adminOnly: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuthStore();
  const isAdmin = role !== "worker";

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden bg-bg-sidebar border-t border-border-secondary">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            data-tour={`nav-${item.href.replace('/', '')}`}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5 text-[10px] font-medium transition-colors duration-150",
              isActive
                ? "text-accent"
                : "text-text-muted"
            )}
          >
            <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
