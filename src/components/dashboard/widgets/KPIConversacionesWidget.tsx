"use client";

import { MessageCircle } from "lucide-react";
import { KPICard } from "../KPICard";
import type { WidgetProps } from "@/types/dashboard";

export function KPIConversacionesWidget({ stats }: WidgetProps) {
  if (!stats) {
    return (
      <div className="bg-bg-secondary border border-border-secondary rounded-xl p-5 animate-pulse h-[100px]" />
    );
  }
  return (
    <KPICard
      title="Conversaciones"
      value={stats.conversaciones_recibidas}
      icon={MessageCircle}
      accent
      delta={stats.deltas?.conversaciones}
      description="Total de conversaciones nuevas iniciadas en el período seleccionado."
    />
  );
}
