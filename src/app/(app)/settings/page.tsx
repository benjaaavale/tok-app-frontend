"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { AgentSettings } from "@/components/settings/AgentSettings";
import { KnowledgeBase } from "@/components/settings/KnowledgeBase";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { GoogleCalendarSettings } from "@/components/settings/GoogleCalendarSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { WorkerManager } from "@/components/settings/WorkerManager";
import { ServiceTypeManager } from "@/components/settings/ServiceTypeManager";
import { UserProfileSettings } from "@/components/settings/UserProfileSettings";
import {
  Settings,
  LogOut,
  User,
  Users,
  CalendarDays,
  Plug,
  Bot,
  Save,
  Undo2,
} from "lucide-react";

/* ── Tab definitions ── */
const TABS = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "equipo", label: "Equipo", icon: Users },
  { id: "calendario", label: "Calendario", icon: CalendarDays },
  { id: "agente", label: "Agente IA", icon: Bot },
  { id: "integraciones", label: "Integraciones", icon: Plug },
] as const;

/* ── Dirty info type ── */
interface DirtyEntry {
  save: () => void;
  discard: () => void;
}

export default function SettingsPage() {
  const { signOut } = useClerk();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("perfil");
  const [shaking, setShaking] = useState(false);

  // Track dirty state per section key
  const [dirtyMap, setDirtyMap] = useState<Record<string, DirtyEntry>>({});
  const isDirty = Object.keys(dirtyMap).length > 0;

  // Google Calendar redirect handler
  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (googleStatus === "connected") {
      toast.success("Google Calendar conectado exitosamente");
      window.history.replaceState({}, "", "/settings");
      setActiveTab("calendario");
    } else if (googleStatus === "error") {
      toast.error("Error conectando Google Calendar");
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  /* ── Dirty handlers ── */
  const makeDirtyHandler = useCallback(
    (key: string) =>
      (dirty: boolean, save: () => void, discard: () => void) => {
        setDirtyMap((prev) => {
          if (dirty) return { ...prev, [key]: { save, discard } };
          if (!(key in prev)) return prev; // no change — avoid re-render
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

  /* ── Tab switching with dirty guard ── */
  const handleTabChange = (newTab: string) => {
    if (isDirty) {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }
    setActiveTab(newTab);
  };

  /* ── Save / Discard all dirty sections ── */
  const saveAll = () => {
    Object.values(dirtyMap).forEach((entry) => entry.save());
  };
  const discardAll = () => {
    Object.values(dirtyMap).forEach((entry) => entry.discard());
    setDirtyMap({});
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Settings size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="text-[18px] font-semibold text-text-primary">
            Configuración
          </h1>
          <p className="text-[11px] text-text-muted">
            Administra tu cuenta, equipo e integraciones
          </p>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <ScrollArea>
          <TabsList className="mb-6 overflow-hidden rounded-lg border border-border-secondary">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id}>
                  <Icon
                    className="-ms-0.5 me-1.5 opacity-60"
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* ── Tab Contents ── */}
        <TabsContent value="perfil" className="space-y-6">
          <UserProfileSettings />
          {/* ── Sign out ── */}
          <div className="pt-2 pb-4">
            <button
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-150 w-full justify-center dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </TabsContent>

        <TabsContent value="equipo" className="space-y-6">
          <CompanySettings onDirtyChange={handleCompanyDirty} />
          <WorkerManager />
          <ServiceTypeManager />
        </TabsContent>

        <TabsContent value="calendario" className="space-y-6">
          <GoogleCalendarSettings />
          <NotificationSettings onDirtyChange={handleNotifDirty} />
        </TabsContent>

        <TabsContent value="agente" className="space-y-6">
          <AgentSettings />
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="integraciones" className="space-y-6">
          <IntegrationSettings onDirtyChange={handleIntegDirty} />
        </TabsContent>
      </Tabs>

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
            {/* Pulsing dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>

            <span className="text-[12px] text-text-primary font-medium whitespace-nowrap">
              Cambios sin guardar
            </span>

            {/* Discard */}
            <button
              onClick={discardAll}
              className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-bg-hover transition-all"
            >
              <Undo2 size={12} />
              Descartar
            </button>

            {/* Save — glow effect */}
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
