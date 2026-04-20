"use client";

import { Zap } from "lucide-react";
import type { WidgetProps } from "@/types/dashboard";

// TODO: conectar endpoint real /stats/ia-mensajes
const MOCK = { procesados: 1248, semana_anterior: 1074 };

export function MensajesProcesadosIAWidget({ stats }: WidgetProps) {
  const procesados = stats ? stats.mensajes_totales : MOCK.procesados;
  const anterior = MOCK.semana_anterior;
  const delta = anterior > 0 ? Math.round(((procesados - anterior) / anterior) * 100) : 0;
  const isPositive = delta >= 0;

  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-text-muted font-medium mb-1">Mensajes procesados por IA</p>
          <p className="text-[28px] font-bold text-text-primary tracking-tight">{procesados.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Zap size={15} className="text-accent" />
          </div>
          {delta !== 0 && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                isPositive
                  ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                  : "text-red-500 border-red-500/20 bg-red-500/5"
              }`}
            >
              {isPositive ? "+" : ""}{delta}%
            </span>
          )}
        </div>
      </div>
      <p className="text-[10px] text-text-muted mt-2">
        Total de mensajes entrantes analizados por el agente IA
      </p>
    </div>
  );
}
