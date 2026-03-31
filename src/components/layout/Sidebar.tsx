"use client";

import { useState, useEffect } from "react";
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
  User,
  Users,
  Plug,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/* ── Types ── */
type NavChild = { param: string; label: string };
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
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

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { companyNombre, userAvatarUrl, userInitials, role, canRespondChats } =
    useAuthStore();
  const isAdmin = role !== "worker";

  /* ── Track expanded sections ── */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Auto-expand section matching current pathname
  useEffect(() => {
    const allItems = [...mainNavItems, settingsItem];
    allItems.forEach((item) => {
      if (
        item.children &&
        (pathname === item.href || pathname.startsWith(item.href + "/"))
      ) {
        setExpanded((prev) => {
          if (prev.has(item.href)) return prev;
          return new Set(prev).add(item.href);
        });
      }
    });
  }, [pathname]);

  const toggleSection = (href: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

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
    if (!tab) return child === item.children![0]; // first child is default
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
    const isExpanded = expanded.has(item.href);

    return (
      <div key={item.href}>
        {/* Parent link */}
        <div className="flex items-center">
          <Link
            href={item.href}
            title={!open ? item.label : undefined}
            data-tour={`nav-${item.href.replace("/", "")}`}
            onClick={(e) => {
              if (hasChildren && open) {
                e.preventDefault();
                toggleSection(item.href);
              }
            }}
            className={cn(
              "flex items-center flex-1 h-[44px] rounded-xl text-[13px] font-medium",
              "transition-all duration-150",
              open ? "gap-3 px-[12px]" : "justify-center",
              isActive
                ? "bg-accent-light text-accent font-semibold"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
            )}
          >
            <item.icon
              size={20}
              strokeWidth={isActive ? 2 : 1.5}
              className="flex-shrink-0"
            />
            <span
              className="flex-1 whitespace-nowrap overflow-hidden"
              style={{
                opacity: open ? 1 : 0,
                width: open ? "auto" : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              {item.label}
            </span>
            {hasChildren && (
              <ChevronRight
                size={14}
                className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  isExpanded && "rotate-90",
                )}
                style={{
                  opacity: open ? 0.5 : 0,
                  width: open ? 14 : 0,
                  transition: "opacity 0.2s ease",
                }}
              />
            )}
          </Link>
        </div>

        {/* Children */}
        {hasChildren && (
          <div
            className="overflow-hidden transition-all duration-200 ease-in-out"
            style={{
              maxHeight: open && isExpanded ? `${item.children!.length * 36}px` : 0,
              opacity: open && isExpanded ? 1 : 0,
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
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col h-screen bg-bg-sidebar flex-shrink-0 overflow-hidden"
        style={{
          width: open ? 220 : 68,
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center h-[68px]"
          style={{
            paddingLeft: open ? 14 : 0,
            justifyContent: open ? "flex-start" : "center",
            transition:
              "padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            className="flex-shrink-0"
            style={{
              width: open ? 44 : 28,
              height: open ? 44 : 28,
              transition:
                "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
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
        </div>

        {/* ── Main Navigation ── */}
        <nav className="flex-1 px-[12px] pt-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {visibleItems.map(renderItem)}
        </nav>

        {/* ── Bottom area ── */}
        <div className="px-[12px] pb-4 space-y-0.5">
          {/* Settings (admin only) */}
          {isAdmin && renderItem(settingsItem)}

          {/* Theme toggle */}
          <div className="flex items-center justify-center py-2">
            <ThemeToggle compact={!open} />
          </div>

          {/* Separator */}
          <div className="border-t border-border-secondary pt-1 mt-1" />

          {/* User profile */}
          <div
            className={cn(
              "flex items-center h-[50px]",
              open ? "gap-3 px-[12px]" : "justify-center",
            )}
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
                width: open ? "auto" : 0,
                transition: "opacity 0.2s ease",
              }}
            >
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
    </>
  );
}
