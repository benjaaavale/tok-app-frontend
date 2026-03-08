"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Mensajes", icon: MessageCircle },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden bg-bg-sidebar/80 backdrop-blur-xl border-t border-border-secondary">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
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
