"use client";

import { Clock, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { WidgetProps } from "@/types/dashboard";

// TODO: conectar endpoint real /stats/tiempo-respuesta que retorne { promedio_min, promedio_anterior_min }
// Por ahora usa datos mock realistas
const MOCK_DATA = {
  promedio_min: 4.2,
  promedio_anterior_min: 6.8,
  p50_min: 2.1,
  p90_min: 12.5,
};

function formatMinutes(min: number): string {
  if (min < 1) return `${Math.round(min * 60)}s`;
  if (min < 60) return `${min.toFixed(1)}m`;
  return `${(min / 60).toFixed(1)}h`;
}

export function TiempoRespuestaWidget(_props: WidgetProps) {
  const data = MOCK_DATA;
  const delta = data.promedio_anterior_min > 0
    ? Math.round(((data.promedio_min - data.promedio_anterior_min) / data.promedio_anterior_min) * 100)
    : 0;

  // Para tiempo de respuesta, bajar es mejor (delta negativo = verde)
  const isBetter = delta <= 0;

  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-text-muted font-medium mb-1">
            Tiempo prom. de primera respuesta
          </p>
          <p className="text-[32px] font-bold text-text-primary tracking-tight leading-none">
            {formatMinutes(data.promedio_min)}
          </p>
          <p className="text-[11px] text-text-muted mt-1.5">
            vs {formatMinutes(data.promedio_anterior_min)} período anterior
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Clock size={16} className="text-accent" />
          </div>
          {delta !== 0 && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-0.5 ${
                isBetter
                  ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                  : "text-red-500 border-red-500/20 bg-red-500/5"
              }`}
            >
              {delta > 0 ? <ArrowUp size={10} /> : delta < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-bg-primary rounded-xl p-3 border border-border-secondary">
          <p className="text-[10px] text-text-muted mb-0.5">Mediana (P50)</p>
          <p className="text-[16px] font-semibold text-text-primary">{formatMinutes(data.p50_min)}</p>
        </div>
        <div className="bg-bg-primary rounded-xl p-3 border border-border-secondary">
          <p className="text-[10px] text-text-muted mb-0.5">P90</p>
          <p className="text-[16px] font-semibold text-text-primary">{formatMinutes(data.p90_min)}</p>
        </div>
      </div>

      <p className="text-[10px] text-text-muted mt-3 italic">
        Datos mock — conectar endpoint real
      </p>
    </div>
  );
}
