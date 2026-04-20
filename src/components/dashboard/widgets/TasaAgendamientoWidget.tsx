"use client";

import { CalendarCheck } from "lucide-react";
import type { WidgetProps } from "@/types/dashboard";
import { ETAPA_LABELS } from "@/lib/constants";

export function TasaAgendamientoWidget({ stats }: WidgetProps) {
  if (!stats) {
    return (
      <div className="bg-bg-secondary border border-border-secondary rounded-xl p-5 animate-pulse h-[120px]" />
    );
  }

  // Calcula desde funnel: alta_intencion -> agendado
  const altaIntencion = stats.funnel?.find((f) => f.etapa === "alta_intencion")?.cantidad ?? 0;
  const agendado = stats.funnel?.find((f) => f.etapa === "agendado")?.cantidad ?? 0;
  const tasa = altaIntencion > 0 ? Math.round((agendado / altaIntencion) * 100) : 0;

  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-text-muted font-medium mb-1">Tasa de agendamiento</p>
          <p className="text-[28px] font-bold text-text-primary tracking-tight">{tasa}%</p>
          <p className="text-[10px] text-text-muted mt-0.5">
            {ETAPA_LABELS["alta_intencion"] || "Alta intención"} → {ETAPA_LABELS["agendado"] || "Agendado"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <CalendarCheck size={18} className="text-emerald-500" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px]">
        <div>
          <span className="text-text-muted">Alta intención: </span>
          <span className="font-semibold text-text-primary">{altaIntencion}</span>
        </div>
        <div>
          <span className="text-text-muted">Agendados: </span>
          <span className="font-semibold text-text-primary">{agendado}</span>
        </div>
      </div>
    </div>
  );
}
