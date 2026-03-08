"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { resolveMediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Mensajes", icon: MessageCircle },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials } = useAuthStore();

  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <aside className="hidden lg:flex flex-col w-[68px] hover:w-[220px] h-screen bg-bg-sidebar border-r border-border-secondary transition-[width] duration-300 ease-in-out group/sidebar overflow-hidden flex-shrink-0">
      {/* ── Logo ── */}
      <div className="flex items-center h-[64px] px-3 pt-3 pb-1">
        <div className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center">
          <Image
            src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
            alt="ToK"
            width={36}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </div>
        <span className="ml-1.5 text-[18px] font-bold text-text-primary whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
          ToK
        </span>
      </div>

      {/* ── Section label ── */}
      <div className="px-5 pt-4 pb-1 h-[28px]">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
          Menú
        </span>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="flex-1 px-2.5 pt-1 space-y-0.5">
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 border overflow-hidden",
                isActive
                  ? "bg-accent-light text-accent border-accent-muted font-semibold"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary border-transparent hover:border-border-secondary"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
              <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom area ── */}
      <div className="px-2.5 pb-4 space-y-1">
        {/* Settings */}
        <Link
          href="/settings"
          title="Configuración"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 border overflow-hidden",
            isSettingsActive
              ? "bg-accent-light text-accent border-accent-muted font-semibold"
              : "text-text-secondary hover:bg-bg-hover hover:text-text-primary border-transparent hover:border-border-secondary"
          )}
        >
          <Settings size={20} strokeWidth={isSettingsActive ? 2 : 1.5} className="flex-shrink-0" />
          <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
            Configuración
          </span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-[12px] text-text-muted hover:bg-bg-hover hover:text-text-secondary transition-all duration-150 overflow-hidden"
        >
          {theme === "dark" ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
          <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 border-t border-border-secondary pt-3 mt-1 overflow-hidden">
          {userAvatarUrl ? (
            <img
              src={resolveMediaUrl(userAvatarUrl)}
              alt="Avatar"
              className="w-[34px] h-[34px] rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
              style={{ background: "var(--gradient-accent)" }}
            >
              {userInitials || "TK"}
            </div>
          )}
          <div className="flex-1 min-w-0 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 delay-100">
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
