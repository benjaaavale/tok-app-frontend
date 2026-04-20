"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { MetaIntegration } from "@/components/settings/MetaIntegration";
import { GoogleCalendarSettings } from "@/components/settings/GoogleCalendarSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { WorkerManager } from "@/components/settings/WorkerManager";
import { ServiceTypeManager } from "@/components/settings/ServiceTypeManager";
import { UserProfileSettings } from "@/components/settings/UserProfileSettings";
import { WorkerAssignmentSettings } from "@/components/settings/WorkerAssignmentSettings";
import {
  LogOut,
  User,
  Users,
  CalendarDays,
  Plug,
  Save,
  Undo2,
  Building2,
  Briefcase,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaWhatsapp, FaMeta } from "react-icons/fa6";

/* ── Section definitions ── */
type SectionId =
  | "perfil"
  | "empresa"
  | "equipo"
  | "servicios"
  | "whatsapp"
  | "meta"
  | "calendario"
  | "notificaciones";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string; strokeWidth?: number }>;
  description?: string;
}

interface SectionGroup {
  label: string;
  items: SectionDef[];
}

const GROUPS: SectionGroup[] = [
  {
    label: "Cuenta",
    items: [
      { id: "perfil", label: "Perfil", icon: User, description: "Datos personales y sesión" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "empresa", label: "Empresa", icon: Building2, description: "Datos de tu negocio" },
      { id: "equipo", label: "Equipo", icon: Users, description: "Trabajadores y asignación" },
      { id: "servicios", label: "Servicios", icon: Briefcase, description: "Tipos de eventos" },
    ],
  },
  {
    label: "Canales",
    items: [
      { id: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, description: "YCloud API" },
      { id: "meta", label: "Meta", icon: FaMeta, description: "Messenger e Instagram" },
    ],
  },
  {
    label: "Automatización",
    items: [
      { id: "calendario", label: "Calendario", icon: CalendarDays, description: "Google Calendar" },
      { id: "notificaciones", label: "Notificaciones", icon: Bell, description: "Recordatorios" },
    ],
  },
];

const ALL_SECTIONS: SectionDef[] = GROUPS.flatMap((g) => g.items);

/* ── Dirty info type ── */
interface DirtyEntry {
  save: () => void;
  discard: () => void;
}

export default function SettingsPage() {
  const { signOut } = useClerk();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sectionFromUrl = searchParams.get("section") as SectionId | null;
  // Legacy: ?tab=equipo|calendario|integraciones|perfil
  const tabFromUrl = searchParams.get("tab");
  const legacyMap: Record<string, SectionId> = {
    perfil: "perfil",
    equipo: "equipo",
    calendario: "calendario",
    integraciones: "meta",
  };

  const initialSection: SectionId =
    sectionFromUrl && ALL_SECTIONS.some((s) => s.id === sectionFromUrl)
      ? sectionFromUrl
      : tabFromUrl && legacyMap[tabFromUrl]
      ? legacyMap[tabFromUrl]
      : "perfil";

  const [activeSection, setActiveSection] = useState<SectionId>(initialSection);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Sync from URL
  useEffect(() => {
    if (sectionFromUrl && ALL_SECTIONS.some((s) => s.id === sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    } else if (tabFromUrl && legacyMap[tabFromUrl]) {
      setActiveSection(legacyMap[tabFromUrl]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionFromUrl, tabFromUrl]);

  // Track dirty state per section key
  const [dirtyMap, setDirtyMap] = useState<Record<string, DirtyEntry>>({});
  const isDirty = Object.keys(dirtyMap).length > 0;

  /* ── OAuth redirect handlers ── */
  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (googleStatus === "connected") {
      toast.success("Google Calendar conectado exitosamente");
      window.history.replaceState({}, "", "/settings?section=calendario");
      setActiveSection("calendario");
    } else if (googleStatus === "error") {
      toast.error("Error conectando Google Calendar");
      window.history.replaceState({}, "", "/settings?section=calendario");
    }
  }, [searchParams]);

  useEffect(() => {
    const igStatus = searchParams.get("instagram");
    if (igStatus === "connected") {
      toast.success("Instagram conectado correctamente ✓");
      window.history.replaceState({}, "", "/settings?section=meta");
      setActiveSection("meta");
    } else if (igStatus === "error") {
      const reason = searchParams.get("reason");
      toast.error(
        reason
          ? `Error al conectar Instagram: ${reason}`
          : "Error al conectar Instagram. Intenta de nuevo."
      );
      window.history.replaceState({}, "", "/settings?section=meta");
      setActiveSection("meta");
    }
  }, [searchParams]);

  useEffect(() => {
    const metaStatus = searchParams.get("meta");
    if (metaStatus === "connected") {
      toast.success("Meta conectado correctamente ✓");
      window.history.replaceState({}, "", "/settings?section=meta");
      setActiveSection("meta");
    } else if (metaStatus === "error") {
      const reason = searchParams.get("reason");
      if (reason === "no_pages") {
        toast.error(
          "No se encontraron Páginas de Facebook. Asegúrate de seleccionar tu página cuando Facebook lo solicite.",
          { duration: 8000 }
        );
      } else {
        toast.error("Error al conectar Meta. Intenta de nuevo.");
      }
      window.history.replaceState({}, "", "/settings?section=meta");
      setActiveSection("meta");
    }
  }, [searchParams]);

  /* ── Dirty handlers ── */
  const makeDirtyHandler = useCallback(
    (key: string) =>
      (dirty: boolean, save: () => void, discard: () => void) => {
        setDirtyMap((prev) => {
          if (dirty) return { ...prev, [key]: { save, discard } };
          if (!(key in prev)) return prev;
          const { [key]: _, ...rest } = prev;
          void _;
          return rest;
        });
      },
    [],
  );

  const handleCompanyDirty = makeDirtyHandler("empresa");
  const handleNotifDirty = makeDirtyHandler("notificaciones");
  const handleIntegDirty = makeDirtyHandler("integraciones");

  /* ── Section switching with dirty guard ── */
  const handleSectionChange = (newSection: SectionId) => {
    if (isDirty) {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }
    setActiveSection(newSection);
    setMobileNavOpen(false);
    router.replace(`/settings?section=${newSection}`, { scroll: false });
  };

  const saveAll = () => Object.values(dirtyMap).forEach((entry) => entry.save());
  const discardAll = () => {
    Object.values(dirtyMap).forEach((entry) => entry.discard());
    setDirtyMap({});
  };

  const activeDef = ALL_SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="flex h-full min-h-0 bg-bg-primary">
      {/* ── Secondary navigation panel (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-[240px] border-r border-border-secondary bg-bg-secondary flex-shrink-0">
        <div className="px-5 pt-5 pb-3">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[1.2px]">
            Workspace
          </p>
          <h1 className="text-[17px] font-semibold text-text-primary mt-0.5">Configuración</h1>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-[1px]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all",
                        isActive
                          ? "bg-accent/12 text-accent"
                          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                      )}
                    >
                      <Icon size={15} className={isActive ? "text-accent" : "text-text-muted"} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight size={13} className="text-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Mobile nav trigger + slide-over ── */}
      <div className="lg:hidden w-full flex flex-col">
        {/* Breadcrumb header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-secondary bg-bg-secondary">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex items-center gap-1.5 text-[13px] text-text-primary"
          >
            <ChevronLeft size={16} className="text-text-muted" />
            <span className="text-text-muted">Configuración</span>
          </button>
          <span className="text-text-muted">/</span>
          <span className="text-[13px] font-semibold text-text-primary">{activeDef.label}</span>
        </div>

        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
                className="fixed inset-0 z-[90] bg-black/40 lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-[91] w-[280px] bg-bg-secondary border-r border-border-secondary flex flex-col lg:hidden"
              >
                <div className="px-5 pt-5 pb-3">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[1.2px]">
                    Workspace
                  </p>
                  <h1 className="text-[17px] font-semibold text-text-primary mt-0.5">Configuración</h1>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
                  {GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-[1px]">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSectionChange(item.id)}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                                isActive
                                  ? "bg-accent/12 text-accent"
                                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                              )}
                            >
                              <Icon size={16} className={isActive ? "text-accent" : "text-text-muted"} />
                              <span className="flex-1 text-left">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-5">
            <SectionHeader def={activeDef} />
            <div className="space-y-6 mt-5">
              <SectionContent
                section={activeSection}
                onCompanyDirty={handleCompanyDirty}
                onNotifDirty={handleNotifDirty}
                onIntegDirty={handleIntegDirty}
                signOut={() => signOut({ redirectUrl: "/login" })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop content area ── */}
      <main className="hidden lg:flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <SectionHeader def={activeDef} />
            <div className="space-y-6 mt-6">
              <SectionContent
                section={activeSection}
                onCompanyDirty={handleCompanyDirty}
                onNotifDirty={handleNotifDirty}
                onIntegDirty={handleIntegDirty}
                signOut={() => signOut({ redirectUrl: "/login" })}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ── Floating unsaved changes bar ── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              x: shaking ? [0, -10, 10, -6, 6, -2, 2, 0] : 0,
            }}
            exit={{ y: 80, opacity: 0 }}
            transition={{
              y: { type: "spring", damping: 20, stiffness: 300 },
              x: { duration: 0.5, ease: "easeInOut" },
              opacity: { duration: 0.2 },
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-bg-secondary border border-border-secondary shadow-lg"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <span className="text-[12px] text-text-primary font-medium whitespace-nowrap">
              Cambios sin guardar
            </span>
            <button
              onClick={discardAll}
              className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-all"
            >
              <Undo2 size={12} />
              Descartar
            </button>
            <button
              onClick={saveAll}
              className="flex items-center gap-1.5 text-[11px] text-white font-semibold bg-accent hover:bg-accent-hover px-4 py-1.5 rounded-lg shadow-[0_0_16px_rgba(37,99,235,0.4)] hover:shadow-[0_0_24px_rgba(37,99,235,0.5)] transition-all"
            >
              <Save size={12} />
              Guardar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ def }: { def: SectionDef }) {
  const Icon = def.icon;
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-border-secondary">
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
        <Icon size={18} className="text-accent" />
      </div>
      <div>
        <h2 className="text-[18px] font-semibold text-text-primary">{def.label}</h2>
        {def.description && (
          <p className="text-[12px] text-text-muted mt-0.5">{def.description}</p>
        )}
      </div>
    </div>
  );
}

/* ── Section content router ── */
function SectionContent({
  section,
  onCompanyDirty,
  onNotifDirty,
  onIntegDirty,
  signOut,
}: {
  section: SectionId;
  onCompanyDirty: (dirty: boolean, save: () => void, discard: () => void) => void;
  onNotifDirty: (dirty: boolean, save: () => void, discard: () => void) => void;
  onIntegDirty: (dirty: boolean, save: () => void, discard: () => void) => void;
  signOut: () => void;
}) {
  switch (section) {
    case "perfil":
      return (
        <>
          <UserProfileSettings />
          <div className="pt-2 pb-4">
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-150 w-full justify-center dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </>
      );
    case "empresa":
      return <CompanySettings onDirtyChange={onCompanyDirty} />;
    case "equipo":
      return (
        <>
          <WorkerManager />
          <WorkerAssignmentSettings />
        </>
      );
    case "servicios":
      return <ServiceTypeManager />;
    case "whatsapp":
      return <IntegrationSettings onDirtyChange={onIntegDirty} />;
    case "meta":
      return (
        <div className="bg-bg-secondary rounded-2xl border border-border-secondary px-5 py-4">
          <MetaIntegration />
        </div>
      );
    case "calendario":
      return <GoogleCalendarSettings />;
    case "notificaciones":
      return <NotificationSettings onDirtyChange={onNotifDirty} />;
    default:
      return null;
  }
}
