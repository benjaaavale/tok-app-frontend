"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TemplateList } from "@/components/templates/TemplateList";
import { StaleLeadsList } from "@/components/templates/StaleLeadsList";
import { Info, X, FileText, Users } from "lucide-react";

const TABS = [
  { id: "plantillas", label: "Plantillas", icon: FileText },
  { id: "leads", label: "Leads sin respuesta", icon: Users },
] as const;

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("plantillas");
  const [bannerVisible, setBannerVisible] = useState(true);

  // Sync tab from URL
  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("plantillas");
    }
  }, [tabFromUrl]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* 24h Info Banner */}
      {bannerVisible && (
        <div className="flex items-start gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-xl">
          <Info size={16} className="text-[var(--text-secondary)] flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-[var(--text-secondary)] flex-1 leading-relaxed">
            WhatsApp solo permite enviar mensajes libres dentro de las primeras 24 horas después de que el contacto escriba. Después de ese plazo, solo puedes contactarlos con plantillas aprobadas por Meta.
          </p>
          <button
            onClick={() => setBannerVisible(false)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea>
          <TabsList className="mb-6 overflow-hidden rounded-lg border border-[var(--border-secondary)] lg:hidden">
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

        <TabsContent value="plantillas">
          <TemplateList />
        </TabsContent>

        <TabsContent value="leads">
          <StaleLeadsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
