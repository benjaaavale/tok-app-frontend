"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TemplateList } from "@/components/templates/TemplateList";
import { StaleLeadsList } from "@/components/templates/StaleLeadsList";
import { Info, X, Megaphone, Users, ChevronLeft, ChevronRight } from "lucide-react";

type SectionId = "plantillas" | "leads";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  description?: string;
}

interface SectionGroup {
  label: string;
  items: SectionDef[];
}

const GROUPS: SectionGroup[] = [
  {
    label: "Mensajería",
    items: [
      { id: "plantillas", label: "Plantillas", icon: Megaphone, description: "Plantillas aprobadas por Meta" },
      { id: "leads", label: "Leads sin respuesta", icon: Users, description: "Reactivar contactos inactivos" },
    ],
  },
];

const ALL_SECTIONS: SectionDef[] = GROUPS.flatMap((g) => g.items);

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sectionFromUrl = searchParams.get("section") as SectionId | null;
  const tabFromUrl = searchParams.get("tab") as SectionId | null; // legacy

  const initial: SectionId =
    sectionFromUrl && ALL_SECTIONS.some((s) => s.id === sectionFromUrl)
      ? sectionFromUrl
      : tabFromUrl && ALL_SECTIONS.some((s) => s.id === tabFromUrl)
      ? tabFromUrl
      : "plantillas";

  const [activeSection, setActiveSection] = useState<SectionId>(initial);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    if (sectionFromUrl && ALL_SECTIONS.some((s) => s.id === sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    } else if (tabFromUrl && ALL_SECTIONS.some((s) => s.id === tabFromUrl)) {
      setActiveSection(tabFromUrl);
    }
  }, [sectionFromUrl, tabFromUrl]);

  const handleSectionChange = (id: SectionId) => {
    setActiveSection(id);
    setMobileNavOpen(false);
    router.replace(`/templates?section=${id}`, { scroll: false });
  };

  const activeDef = ALL_SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="flex h-full min-h-0 bg-bg-primary">
      {/* ── Secondary nav (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-[240px] border-r border-border-secondary bg-bg-secondary flex-shrink-0">
        <div className="px-5 pt-5 pb-3">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[1.2px]">
            Mensajería
          </p>
          <h1 className="text-[17px] font-semibold text-text-primary mt-0.5">Plantillas</h1>
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

      {/* ── Mobile ── */}
      <div className="lg:hidden w-full flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-secondary bg-bg-secondary">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex items-center gap-1.5 text-[13px] text-text-primary"
          >
            <ChevronLeft size={16} className="text-text-muted" />
            <span className="text-text-muted">Plantillas</span>
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
                    Mensajería
                  </p>
                  <h1 className="text-[17px] font-semibold text-text-primary mt-0.5">Plantillas</h1>
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
          <Body
            section={activeSection}
            bannerVisible={bannerVisible}
            onCloseBanner={() => setBannerVisible(false)}
            mobile
          />
        </div>
      </div>

      {/* ── Desktop content ── */}
      <main className="hidden lg:flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Body
            section={activeSection}
            bannerVisible={bannerVisible}
            onCloseBanner={() => setBannerVisible(false)}
          />
        </div>
      </main>
    </div>
  );
}

function Body({
  section,
  bannerVisible,
  onCloseBanner,
  mobile = false,
}: {
  section: SectionId;
  bannerVisible: boolean;
  onCloseBanner: () => void;
  mobile?: boolean;
}) {
  return (
    <div className={cn("max-w-4xl mx-auto space-y-5", mobile ? "px-4 py-5" : "px-8 py-8")}>
      {bannerVisible && section === "plantillas" && (
        <div className="flex items-start gap-3 p-4 bg-bg-secondary border border-border-secondary rounded-xl">
          <Info size={16} className="text-text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-text-secondary flex-1 leading-relaxed">
            WhatsApp solo permite enviar mensajes libres dentro de las primeras 24 horas después de que el contacto escriba. Después de ese plazo, solo puedes contactarlos con plantillas aprobadas por Meta.
          </p>
          <button
            onClick={onCloseBanner}
            className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {section === "plantillas" && <TemplateList />}
      {section === "leads" && <StaleLeadsList />}
    </div>
  );
}
