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
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Mensajes", icon: MessageCircle },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials } = useAuthStore();

  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        className="hidden lg:flex flex-col h-screen bg-bg-sidebar flex-shrink-0 overflow-hidden"
        animate={{ width: open ? 220 : 68 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* ── Logo ── */}
        <div className="flex items-center h-[68px] px-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <Image
                src="/logo-blanco.png"
                alt="ToK"
                width={52}
                height={52}
                className="w-7 h-7 object-contain"
                priority
              />
            </div>
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="font-semibold text-sm text-white whitespace-pre"
            >
              ToK
            </motion.span>
          </div>
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
                  "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] font-medium",
                  "transition-colors duration-150",
                  isActive
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/60 hover:bg-white/10 hover:text-white/90"
                )}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="flex-shrink-0"
                />
                <motion.span
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-pre !p-0 !m-0"
                >
                  {item.label}
                </motion.span>
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
              "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] font-medium",
              "transition-colors duration-150",
              isSettingsActive
                ? "bg-white/15 text-white font-semibold"
                : "text-white/60 hover:bg-white/10 hover:text-white/90"
            )}
          >
            <Settings
              size={20}
              strokeWidth={isSettingsActive ? 2 : 1.5}
              className="flex-shrink-0"
            />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="whitespace-pre !p-0 !m-0"
            >
              Configuración
            </motion.span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={
              !open
                ? theme === "dark"
                  ? "Modo claro"
                  : "Modo oscuro"
                : undefined
            }
            className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl text-[12px] text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors duration-150"
          >
            {theme === "dark" ? (
              <Sun size={18} className="flex-shrink-0" />
            ) : (
              <Moon size={18} className="flex-shrink-0" />
            )}
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="whitespace-pre !p-0 !m-0"
            >
              {theme === "dark" ? "Modo claro" : "Modo oscuro"}
            </motion.span>
          </button>

          {/* Separator */}
          <div className="border-t border-white/10 pt-1 mt-1" />

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
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0 bg-white/20"
              >
                {userInitials || "TK"}
              </div>
            )}
            <motion.div
              animate={{
                display: open ? "block" : "none",
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <p className="text-[12px] font-medium text-white/90 truncate">
                {companyNombre || "Mi empresa"}
              </p>
              <p className="text-[11px] text-white/50 truncate">
                Administrador
              </p>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* ── Mobile Sidebar ── */}
      <MobileSidebar
        open={open}
        setOpen={setOpen}
        pathname={pathname}
        theme={theme}
        setTheme={setTheme}
        companyNombre={companyNombre}
        userAvatarUrl={userAvatarUrl}
        userInitials={userInitials}
        isSettingsActive={isSettingsActive}
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
  setTheme,
  companyNombre,
  userAvatarUrl,
  userInitials,
  isSettingsActive,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  pathname: string;
  theme: string | undefined;
  setTheme: (t: string) => void;
  companyNombre: string | null;
  userAvatarUrl: string | null;
  userInitials: string | null;
  isSettingsActive: boolean;
}) {
  return (
    <>
      {/* Toggle bar */}
      <div className="h-14 px-4 flex items-center justify-between lg:hidden bg-bg-sidebar w-full">
        <Image
          src="/logo-blanco.png"
          alt="ToK"
          width={28}
          height={28}
          priority
        />
        <Menu
          className="text-white/70 cursor-pointer"
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
                className="text-white/70 cursor-pointer"
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
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/60 hover:bg-white/10"
                    )}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="space-y-1 pt-4 border-t border-white/10">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium",
                  isSettingsActive
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/60 hover:bg-white/10"
                )}
              >
                <Settings
                  size={20}
                  strokeWidth={isSettingsActive ? 2 : 1.5}
                />
                Configuración
              </Link>

              <button
                onClick={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm text-white/40 hover:bg-white/10"
              >
                {theme === "dark" ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </button>

              <div className="flex items-center gap-3 px-3 py-3">
                {userAvatarUrl ? (
                  <img
                    src={resolveMediaUrl(userAvatarUrl)}
                    alt="Avatar"
                    className="w-[34px] h-[34px] rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0 bg-white/20"
                  >
                    {userInitials || "TK"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white/90">
                    {companyNombre || "Mi empresa"}
                  </p>
                  <p className="text-xs text-white/50">Administrador</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
