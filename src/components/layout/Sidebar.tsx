"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { resolveMediaUrl, cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  Settings,
  Megaphone,
  Bot,
  ShoppingCart,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CompanySelector } from "@/components/layout/CompanySelector";
import { useConversations } from "@/hooks/useConversations";
import { APP_VERSION } from "@/lib/constants";

/* ── Types ── */
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

/* ── Nav definitions (grouped by section) ── */
const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/conversations", label: "Mensajes", icon: MessageCircle },
      { href: "/calendar", label: "Agenda", icon: CalendarDays },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { href: "/agents", label: "Agentes IA", icon: Bot },
      { href: "/templates", label: "Plantillas", icon: Megaphone },
      { href: "/abandoned-carts", label: "Carritos", icon: ShoppingCart },
    ],
  },
];

const settingsItem: NavItem = {
  href: "/settings",
  label: "Configuración",
  icon: Settings,
};

/* ── Shared transition ── */
const EASE = "0.25s cubic-bezier(0.4, 0, 0.2, 1)";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials, role, canRespondChats, isSuperadmin } =
    useAuthStore();
  const isAdmin = role !== "worker";

  /* ── Unread conversations indicator ── */
  const { data: conversations } = useConversations();
  const hasPendingChats = conversations?.some((c) => c.unread_count > 0) ?? false;

  /* ── Helpers ── */
  const isItemActive = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(item.href + "/");

  /* ── Filter items by role inside a section ── */
  const filterItems = (items: NavItem[]) =>
    items.filter(
      (item) =>
        !(
          item.href === "/conversations" &&
          role === "worker" &&
          !canRespondChats
        ),
    );

  /* ── Render a nav item ── */
  const renderItem = (item: NavItem) => {
    const isActive = isItemActive(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        title={!open ? item.label : undefined}
        data-tour={`nav-${item.href.replace("/", "")}`}
        className={cn(
          "relative flex items-center h-[38px] rounded-lg text-[12.5px] font-medium",
          "transition-colors duration-150",
          isActive
            ? "bg-accent-light text-accent font-semibold"
            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
        )}
        style={{
          gap: open ? 11 : 0,
          paddingLeft: 10,
          paddingRight: 10,
          transition: `gap ${EASE}`,
        }}
      >
        {/* Accent bar on active */}
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-accent"
          style={{
            height: isActive ? 18 : 0,
            opacity: isActive ? 1 : 0,
            transition: "height 0.2s ease, opacity 0.2s ease",
          }}
        />
        <div className="relative flex-shrink-0">
          <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
          {item.href === "/conversations" && hasPendingChats && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-bg-sidebar" />
          )}
        </div>
        <span
          className="whitespace-nowrap overflow-hidden"
          style={{
            opacity: open ? 1 : 0,
            maxWidth: open ? 130 : 0,
            transition: `opacity 0.2s ease, max-width ${EASE}`,
          }}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  /* ── Render a section (header + items) ── */
  const renderSection = (section: NavSection) => {
    const items = filterItems(section.items);
    if (items.length === 0) return null;

    return (
      <div key={section.title} className="space-y-0.5">
        {/* Section header (only visible when sidebar is open) */}
        <div
          className="overflow-hidden"
          style={{
            maxHeight: open ? 24 : 0,
            opacity: open ? 1 : 0,
            transition: `max-height ${EASE}, opacity 0.2s ease`,
          }}
        >
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
            {section.title}
          </p>
        </div>
        {items.map(renderItem)}
      </div>
    );
  };

  return (
    <>
      <aside
        className="hidden lg:flex flex-col h-screen bg-bg-sidebar flex-shrink-0 overflow-hidden border-r border-border-secondary"
        style={{
          width: open ? 208 : 60,
          transition: `width ${EASE}`,
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* ── Logo + Company name ── */}
        <div
          className="flex items-center h-[60px] flex-shrink-0"
          style={{
            paddingLeft: open ? 14 : 15,
            paddingRight: open ? 10 : 0,
            transition: `padding ${EASE}`,
          }}
        >
          <div
            className="flex-shrink-0"
            style={{
              width: open ? 32 : 30,
              height: open ? 32 : 30,
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
              marginLeft: open ? 10 : 0,
              opacity: open ? 1 : 0,
              maxWidth: open ? 140 : 0,
              transition: `opacity 0.2s ease, max-width ${EASE}, margin-left ${EASE}`,
            }}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted leading-none mb-[3px]">
              Empresa
            </p>
            <p className="text-[13px] font-semibold text-text-primary truncate leading-tight">
              {companyNombre || "Mi empresa"}
            </p>
          </div>
        </div>

        {/* Separator under header */}
        <div
          className="mx-3 border-t border-border-secondary"
          style={{
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Super admin company selector */}
        {isSuperadmin && open && (
          <div className="pt-2">
            <CompanySelector />
          </div>
        )}

        {/* ── Main Navigation ── */}
        <nav className="flex-1 px-[10px] pt-3 pb-2 space-y-3 overflow-y-auto overflow-x-hidden">
          {navSections.map(renderSection)}
        </nav>

        {/* ── Bottom area ── */}
        <div className="px-[10px] pb-3 space-y-0.5 flex-shrink-0">
          {isAdmin && (
            <>
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: open ? 24 : 0,
                  opacity: open ? 1 : 0,
                  transition: `max-height ${EASE}, opacity 0.2s ease`,
                }}
              >
                <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  Sistema
                </p>
              </div>
              {renderItem(settingsItem)}
            </>
          )}

          <div className="flex items-center justify-center pt-2 pb-1">
            <ThemeToggle compact={!open} />
          </div>

          <div className="border-t border-border-secondary pt-2 mt-1" />

          {/* User profile */}
          <div
            className="flex items-center h-[48px]"
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
                className="w-[32px] h-[32px] rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                style={{ background: "var(--gradient-accent)" }}
              >
                {userInitials || "TK"}
              </div>
            )}
            <div
              className="min-w-0 overflow-hidden"
              style={{
                opacity: open ? 1 : 0,
                maxWidth: open ? 130 : 0,
                transition: `opacity 0.2s ease, max-width ${EASE}`,
              }}
            >
              <p className="text-[12px] font-medium text-text-primary truncate leading-tight">
                {isAdmin ? "Administrador" : "Trabajador"}
              </p>
              <p className="text-[10px] text-text-muted truncate leading-tight mt-[2px]">
                v{APP_VERSION}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
