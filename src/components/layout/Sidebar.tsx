"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { resolveMediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
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
      <motion.aside
        className="hidden lg:flex flex-col h-screen bg-bg-sidebar flex-shrink-0 overflow-hidden"
        animate={{ width: open ? 220 : 68 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-center h-[68px]">
          <motion.div
            animate={{
              width: open ? 44 : 28,
              height: open ? 44 : 28,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0"
          >
            <Image
              src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
              alt="ToK"
              width={52}
              height={52}
              className="w-full h-full object-contain"
              priority
            />
          </motion.div>
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
          )}

          {/* Theme toggle */}
          <div className="flex items-center justify-center py-2">
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
            <motion.div
              animate={{
                display: open ? "block" : "none",
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <p className="text-[12px] font-medium text-text-primary truncate">
                {companyNombre || "Mi empresa"}
              </p>
              <p className="text-[11px] text-text-muted truncate">
                {isAdmin ? "Administrador" : "Trabajador"}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.aside>

    </>
  );
}
