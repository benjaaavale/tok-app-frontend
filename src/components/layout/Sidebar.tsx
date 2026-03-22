"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { resolveMediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Mensajes", icon: MessageCircle },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials, role } = useAuthStore();
  const isAdmin = role !== "worker";

  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-bg-sidebar flex-shrink-0 overflow-hidden",
          "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "w-[220px]" : "w-[68px]"
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-center h-[68px]">
          <div className={cn(
            "flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            open ? "w-[44px] h-[44px]" : "w-[28px] h-[28px]"
          )}>
            <Image
              src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
              alt="ToK"
              width={52}
              height={52}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className="flex-1 px-2 pt-3 space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!open ? item.label : undefined}
                data-tour={`nav-${item.href.replace('/', '')}`}
                className={cn(
                  "flex items-center rounded-xl text-[13px] font-medium",
                  "transition-all duration-200",
                  open
                    ? "gap-3 px-2.5 py-2.5"
                    : "justify-center w-[44px] h-[44px] mx-auto p-0",
                  isActive
                    ? "bg-accent-light text-accent font-semibold"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                )}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="flex-shrink-0"
                />
                <span className={cn(
                  "whitespace-pre !p-0 !m-0 transition-opacity duration-200",
                  open ? "opacity-100 inline-block" : "opacity-0 hidden"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom area ── */}
        <div className="px-2 pb-4 space-y-0.5">
          {/* Settings (admin only) */}
          {isAdmin && (
            <Link
              href="/settings"
              title={!open ? "Configuración" : undefined}
              data-tour="nav-settings"
              className={cn(
                "flex items-center rounded-xl text-[13px] font-medium",
                "transition-all duration-200",
                open
                  ? "gap-3 px-2.5 py-2.5"
                  : "justify-center w-[44px] h-[44px] mx-auto p-0",
                isSettingsActive
                  ? "bg-accent-light text-accent font-semibold"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <Settings
                size={20}
                strokeWidth={isSettingsActive ? 2 : 1.5}
                className="flex-shrink-0"
              />
              <span className={cn(
                "whitespace-pre !p-0 !m-0 transition-opacity duration-200",
                open ? "opacity-100 inline-block" : "opacity-0 hidden"
              )}>
                Configuración
              </span>
            </Link>
          )}

          {/* Theme toggle */}
          <div className={cn(
            "flex items-center rounded-xl transition-all duration-200",
            open ? "px-2.5 py-2" : "justify-center w-[44px] h-[44px] mx-auto"
          )}>
            <ThemeToggle compact={!open} />
          </div>

          {/* Separator */}
          <div className="border-t border-border-secondary pt-1 mt-1" />

          {/* User profile */}
          <div className={cn(
            "flex items-center py-2",
            open ? "gap-3 px-2.5" : "justify-center"
          )}>
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
            <div className={cn(
              "min-w-0 transition-opacity duration-200",
              open ? "opacity-100 block" : "opacity-0 hidden"
            )}>
              <p className="text-[12px] font-medium text-text-primary truncate">
                {companyNombre || "Mi empresa"}
              </p>
              <p className="text-[11px] text-text-muted truncate">
                {isAdmin ? "Administrador" : "Trabajador"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar ── */}
      <MobileSidebar
        open={open}
        setOpen={setOpen}
        pathname={pathname}
        theme={theme}
        companyNombre={companyNombre}
        userAvatarUrl={userAvatarUrl}
        userInitials={userInitials}
        isSettingsActive={isSettingsActive}
        isAdmin={isAdmin}
      />
    </>
  );
}

/* ── Mobile Sidebar (slide-in overlay) ── */
function MobileSidebar({
  open,
  setOpen,
  pathname,
  theme,
  companyNombre,
  userAvatarUrl,
  userInitials,
  isSettingsActive,
  isAdmin,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  pathname: string;
  theme: string | undefined;
  companyNombre: string | null;
  userAvatarUrl: string | null;
  userInitials: string | null;
  isSettingsActive: boolean;
  isAdmin: boolean;
}) {
  return (
    <>
      {/* Toggle bar */}
      <div className="h-14 px-4 flex items-center justify-between lg:hidden bg-bg-sidebar border-b border-border-secondary w-full flex-shrink-0">
        <Image
          src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
          alt="ToK"
          width={28}
          height={28}
          priority
        />
        <Menu
          className="text-text-secondary cursor-pointer"
          size={24}
          onClick={() => setOpen(true)}
        />
      </div>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col bg-bg-sidebar p-6 lg:hidden"
          >
            {/* Close */}
            <div className="flex justify-end mb-6">
              <X
                className="text-text-secondary cursor-pointer"
                size={24}
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium",
                      isActive
                        ? "bg-accent-light text-accent font-semibold"
                        : "text-text-secondary hover:bg-bg-hover"
                    )}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="space-y-1 pt-4 border-t border-border-secondary">
              {isAdmin && (
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium",
                    isSettingsActive
                      ? "bg-accent-light text-accent font-semibold"
                      : "text-text-secondary hover:bg-bg-hover"
                  )}
                >
                  <Settings
                    size={20}
                    strokeWidth={isSettingsActive ? 2 : 1.5}
                  />
                  Configuración
                </Link>
              )}

              <div className="flex items-center gap-3 px-3 py-3">
                <ThemeToggle />
              </div>

              <div className="flex items-center gap-3 px-3 py-3">
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
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {companyNombre || "Mi empresa"}
                  </p>
                  <p className="text-xs text-text-muted">{isAdmin ? "Administrador" : "Trabajador"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
