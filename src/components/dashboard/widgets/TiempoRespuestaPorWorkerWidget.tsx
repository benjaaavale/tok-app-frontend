"use client";

import { Clock } from "lucide-react";
import { useWorkers } from "@/hooks/useWorkers";
import type { WidgetProps } from "@/types/dashboard";
import { ChartCard, ChartEmpty } from "../ServiciosChart";

function formatMinutes(min: number): string {
  if (min < 1) return `${Math.round(min * 60)}s`;
  if (min < 60) return `${min.toFixed(1)}m`;
  return `${(min / 60).toFixed(1)}h`;
}

// TODO: conectar endpoint real /stats/tiempo-respuesta-por-worker
// Por ahora genera datos mock realistas por cada worker activo.
export function TiempoRespuestaPorWorkerWidget(_props: WidgetProps) {
  const { data: workers } = useWorkers();

  if (!workers) {
    return (
      <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 shadow-sm animate-pulse h-full">
        <div className="h-4 w-40 bg-border-secondary rounded mb-4" />
        <div className="h-40 bg-border-secondary rounded" />
      </div>
    );
  }

  const activeWorkers = workers.filter((w) => w.is_active);

  if (activeWorkers.length === 0) {
    return <ChartEmpty label="Sin workers activos" />;
  }

  // Mock: genera un tiempo promedio pseudoaleatorio pero estable por worker.id
  const rows = activeWorkers.map((w) => {
    const seed = (w.id * 2654435761) % 1000;
    const avg = 1.5 + (seed % 700) / 100; // entre ~1.5 y ~8.5 minutos
    return { id: w.id, name: w.nombre, avg, color: w.color || "#8B5CF6" };
  });

  const maxAvg = Math.max(...rows.map((r) => r.avg), 1);
  const bestAvg = Math.min(...rows.map((r) => r.avg));

  return (
    <ChartCard
      title="Tiempo de respuesta por worker"
      description="Tiempo promedio que cada worker tarda en dar la primera respuesta al cliente."
    >
      <div className="space-y-2.5">
        {rows.map((row) => {
          const pct = Math.max(6, Math.round((row.avg / maxAvg) * 100));
          const isBest = row.avg === bestAvg;
          return (
            <div key={row.id} className="flex items-center gap-3">
              <div className="w-24 flex-shrink-0 flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: row.color }}
                />
                <span className="text-[12px] text-text-primary truncate">
                  {row.name}
                </span>
              </div>
              <div className="flex-1 h-2 rounded-full bg-bg-primary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: row.color }}
                />
              </div>
              <div className="flex items-center gap-1.5 w-20 justify-end flex-shrink-0">
                <Clock size={10} className="text-text-muted" />
                <span className="text-[12px] font-semibold text-text-primary">
                  {formatMinutes(row.avg)}
                </span>
                {isBest && rows.length > 1 && (
                  <span className="text-[9px] font-semibold text-emerald-500">
                    ★
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted mt-3 italic">
        Datos mock — conectar endpoint real
      </p>
    </ChartCard>
  );
}
