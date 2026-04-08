"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { resolveMediaUrl, cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
  FileText,
  Bot,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useConversations } from "@/hooks/useConversations";
import { APP_VERSION } from "@/lib/constants";

/* ── Types ── */
type NavChild = { param: string; label: string };
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  children?: NavChild[];
};

/* ── Nav definitions ── */
const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Mensajes", icon: MessageCircle },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
  {
    href: "/templates",
    label: "Plantillas",
    icon: FileText,
    children: [
      { param: "plantillas", label: "Plantillas" },
      { param: "leads", label: "Leads sin respuesta" },
    ],
  },
  { href: "/agents", label: "Agentes IA", icon: Bot },
];

const settingsItem: NavItem = {
  href: "/settings",
  label: "Configuración",
  icon: Settings,
  children: [
    { param: "perfil", label: "Perfil" },
    { param: "equipo", label: "Equipo" },
    { param: "calendario", label: "Calendario" },
    { param: "integraciones", label: "Integraciones" },
  ],
};

/* ── Shared transition ── */
const EASE = "0.25s cubic-bezier(0.4, 0, 0.2, 1)";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials, role, canRespondChats } =
    useAuthStore();
  const isAdmin = role !== "worker";

  /* ── Unread conversations indicator ── */
  const { data: conversations } = useConversations();
  const hasPendingChats = conversations?.some((c) => c.unread_count > 0) ?? false;

  /* ── Filter nav items by role ── */
  const visibleItems = mainNavItems.filter(
    (item) =>
      !(
        item.href === "/conversations" &&
        role === "worker" &&
        !canRespondChats
      ),
  );

  /* ── Helpers ── */
  const isItemActive = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(item.href + "/");

  const isChildActive = (item: NavItem, child: NavChild) => {
    if (!isItemActive(item)) return false;
    const tab = searchParams.get("tab");
    if (!tab) return child === item.children![0];
    return tab === child.param;
  };

  const childHref = (item: NavItem, child: NavChild) =>
    child === item.children![0]
      ? item.href
      : `${item.href}?tab=${child.param}`;

  /* ── Render a nav item ── */
  const renderItem = (item: NavItem) => {
    const isActive = isItemActive(item);
    const hasChildren = !!item.children;
    const showChildren = hasChildren && isActive && open;

    return (
      <div key={item.href}>
        <Link
          href={item.href}
          title={!open ? item.label : undefined}
          data-tour={`nav-${item.href.replace("/", "")}`}
          className={cn(
            "flex items-center h-[44px] rounded-xl text-[13px] font-medium",
            "transition-colors duration-150",
            isActive
              ? "bg-accent-light text-accent font-semibold"
              : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
          )}
          style={{
            gap: open ? 12 : 0,
            paddingLeft: 12,
            paddingRight: 12,
            transition: `gap ${EASE}`,
          }}
        >
          <div className="relative flex-shrink-0">
            <item.icon
              size={20}
              strokeWidth={isActive ? 2 : 1.5}
            />
            {item.href === "/conversations" && hasPendingChats && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-bg-sidebar" />
            )}
          </div>
          <span
            className="whitespace-nowrap overflow-hidden"
            style={{
              opacity: open ? 1 : 0,
              maxWidth: open ? 125 : 0,
              transition: `opacity 0.2s ease, max-width ${EASE}`,
            }}
          >
            {item.label}
          </span>
          {hasChildren && (
            <ChevronRight
              size={14}
              className={cn(
                "flex-shrink-0 transition-transform duration-200",
                isActive && "rotate-90",
              )}
              style={{
                opacity: open ? 0.4 : 0,
                maxWidth: open ? 14 : 0,
                overflow: "hidden",
                transition: `opacity 0.2s ease, max-width ${EASE}`,
              }}
            />
          )}
        </Link>

        {/* Children — only when section is active */}
        {hasChildren && (
          <div
            className="overflow-hidden"
            style={{
              maxHeight: showChildren
                ? `${item.children!.length * 36 + 8}px`
                : 0,
              opacity: showChildren ? 1 : 0,
              transition: `max-height 0.2s ease, opacity 0.2s ease`,
            }}
          >
            <div className="ml-[20px] pl-[16px] border-l border-border-secondary space-y-0.5 py-1">
              {item.children!.map((child) => {
                const active = isChildActive(item, child);
                return (
                  <Link
                    key={child.param}
                    href={childHref(item, child)}
                    className={cn(
                      "block py-1.5 px-2 rounded-lg text-[12px] transition-colors duration-150",
                      active
                        ? "text-accent font-semibold bg-accent-light"
                        : "text-text-muted hover:text-text-primary hover:bg-bg-hover",
                    )}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className="hidden lg:flex flex-col h-screen bg-bg-sidebar flex-shrink-0 overflow-hidden"
        style={{
          width: open ? 180 : 68,
          transition: `width ${EASE}`,
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* ── Logo + Company name ── */}
        <div
          className="flex items-center h-[68px]"
          style={{
            paddingLeft: open ? 16 : 18,
            transition: `padding-left ${EASE}`,
          }}
        >
          <div
            className="flex-shrink-0"
            style={{
              width: open ? 40 : 32,
              height: open ? 40 : 32,
              transition: `width ${EASE}, height ${EASE}`,
            }}
          >
            <Image
              src={theme === "dark" ? "/logo-blanco.png" : "/logo-negro.png"}
              alt="ToK"
              width={52}
              height={52}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div
            className="min-w-0 overflow-hidden"
            style={{
              marginLeft: open ? 8 : 0,
              opacity: open ? 1 : 0,
              maxWidth: open ? 100 : 0,
              transition: `opacity 0.2s ease, max-width ${EASE}, margin-left ${EASE}`,
            }}
          >
            <p className="text-[13px] font-semibold text-text-primary truncate">
              {companyNombre || "Mi empresa"}
            </p>
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className="flex-1 px-[12px] pt-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {visibleItems.map(renderItem)}
        </nav>

        {/* ── Bottom area ── */}
        <div className="px-[12px] pb-4 space-y-0.5">
          {isAdmin && renderItem(settingsItem)}

          <div className="flex items-center justify-center py-2">
            <ThemeToggle compact={!open} />
          </div>

          <div className="border-t border-border-secondary pt-1 mt-1" />

          {/* User profile */}
          <div
            className="flex items-center h-[50px]"
            style={{
              gap: open ? 10 : 0,
              paddingLeft: open ? 10 : 5,
              paddingRight: open ? 10 : 5,
              transition: `gap ${EASE}, padding ${EASE}`,
            }}
          >
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
            <div
              className="min-w-0 overflow-hidden"
              style={{
                opacity: open ? 1 : 0,
                maxWidth: open ? 110 : 0,
                transition: `opacity 0.2s ease, max-width ${EASE}`,
              }}
            >
              <p className="text-[12px] font-medium text-text-primary truncate">
                {isAdmin ? "Administrador" : "Trabajador"}
              </p>
            </div>
          </div>

          {/* Version */}
          <p
            className="text-center text-text-muted"
            style={{
              fontSize: 10,
              opacity: open ? 0.6 : 0.4,
              transition: `opacity 0.2s ease`,
              paddingTop: 4,
            }}
          >
            v{APP_VERSION}
          </p>
        </div>
      </aside>
    </>
  );
}
