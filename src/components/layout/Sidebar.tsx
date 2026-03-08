"use client";

import { useState } from "react";
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

const ease = "cubic-bezier(0.4, 0, 0.2, 1)";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials } = useAuthStore();

  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  // Animated label style — expands width + fades in when open
  const labelStyle: React.CSSProperties = {
    maxWidth: open ? "160px" : 0,
    opacity: open ? 1 : 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: open
      ? `max-width 280ms ${ease}, opacity 180ms ease ${open ? "80ms" : "0ms"}`
      : `max-width 220ms ${ease}, opacity 100ms ease 0ms`,
  };

  return (
    <aside
      className="hidden lg:flex flex-col h-screen bg-bg-sidebar border-r border-border-secondary flex-shrink-0 overflow-hidden"
      style={{
        width: open ? "220px" : "68px",
        transition: `width 280ms ${ease}`,
        willChange: "width",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-center h-[68px]">
        <Image
          src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
          alt="ToK"
          width={52}
          height={52}
          style={{
            height: open ? "48px" : "32px",
            width: "auto",
            transition: `height 280ms ${ease}`,
          }}
          priority
        />
      </div>

      {/* ── Main Navigation ── */}
      <nav className="flex-1 px-2.5 pt-3 space-y-0.5">
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!open ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] font-medium border",
                "transition-colors duration-150",
                isActive
                  ? "bg-accent-light text-accent border-accent-muted font-semibold"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary border-transparent hover:border-border-secondary"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
              <span style={labelStyle}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom area ── */}
      <div className="px-2.5 pb-4 space-y-0.5">
        {/* Settings */}
        <Link
          href="/settings"
          title={!open ? "Configuración" : undefined}
          className={cn(
            "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] font-medium border",
            "transition-colors duration-150",
            isSettingsActive
              ? "bg-accent-light text-accent border-accent-muted font-semibold"
              : "text-text-secondary hover:bg-bg-hover hover:text-text-primary border-transparent hover:border-border-secondary"
          )}
        >
          <Settings size={20} strokeWidth={isSettingsActive ? 2 : 1.5} className="flex-shrink-0" />
          <span style={labelStyle}>Configuración</span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={!open ? (theme === "dark" ? "Modo claro" : "Modo oscuro") : undefined}
          className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl text-[12px] text-text-muted hover:bg-bg-hover hover:text-text-secondary transition-colors duration-150"
        >
          {theme === "dark"
            ? <Sun size={18} className="flex-shrink-0" />
            : <Moon size={18} className="flex-shrink-0" />}
          <span style={labelStyle}>
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </span>
        </button>

        {/* Separator */}
        <div className="border-t border-border-secondary pt-1 mt-1" />

        {/* User profile */}
        <div className="flex items-center gap-3 px-2.5 py-2">
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
          <div style={labelStyle}>
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
