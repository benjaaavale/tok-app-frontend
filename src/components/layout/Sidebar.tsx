"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Mensajes", icon: MessageCircle },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
  { href: "/settings", label: "Configuraci\u00f3n", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials } = useAuthStore();

  return (
    <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-bg-sidebar border-r border-border-secondary">
      {/* ── Logo ── */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <Image
          src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
          alt="ToK"
          width={36}
          height={36}
          className="rounded-lg"
        />
        <span className="text-[15px] font-semibold text-text-primary tracking-tight">
          ToK
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: theme toggle + user ── */}
      <div className="px-3 pb-4 space-y-3">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] text-text-muted hover:bg-bg-hover hover:text-text-secondary transition-all duration-150"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
          {userAvatarUrl ? (
            <img
              src={userAvatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-semibold">
              {userInitials || "TK"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-text-primary truncate">
              {companyNombre || "Mi empresa"}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
