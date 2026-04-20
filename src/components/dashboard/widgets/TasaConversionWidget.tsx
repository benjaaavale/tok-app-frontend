"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetProps } from "@/types/dashboard";

export function TasaConversionWidget({ stats }: WidgetProps) {
  if (!stats) {
    return <WidgetSkeleton />;
  }

  const tasa = stats.conversion_a_cita;
  const prev = stats.previous?.conversion ?? 0;
  const delta = prev > 0 ? Math.round(((tasa - prev) / prev) * 100) : 0;

  // Simulamos sparkline con datos disponibles del funnel
  const sparkData = stats.funnel
    ? stats.funnel.map((f, i) => ({ v: f.cantidad, i }))
    : Array.from({ length: 7 }, (_, i) => ({ v: Math.floor(Math.random() * 20) + 5, i }));

  const isPositive = delta >= 0;

  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] text-text-muted font-medium mb-1">Tasa de conversion</p>
          <p className="text-[32px] font-bold text-text-primary tracking-tight leading-none">
            {tasa}%
          </p>
          <p className="text-[11px] text-text-muted mt-1.5">
            Conversaciones que terminan en cita
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-accent" />
          </div>
          {delta !== 0 && (
            <span
              className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                isPositive
                  ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                  : "text-red-500 border-red-500/20 bg-red-500/5"
              )}
            >
              {isPositive ? "+" : ""}{delta}%
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 h-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid var(--border-secondary)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "11px",
              }}
              formatter={(v) => [v, "Cantidad"]}
              labelFormatter={() => ""}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="text-center">
          <p className="text-[11px] text-text-muted">Calificados</p>
          <p className="text-[14px] font-semibold text-text-primary">{stats.leads_calificados}</p>
        </div>
        <div className="w-px h-8 bg-border-secondary" />
        <div className="text-center">
          <p className="text-[11px] text-text-muted">Citas</p>
          <p className="text-[14px] font-semibold text-text-primary">{stats.citas_generadas}</p>
        </div>
        <div className="w-px h-8 bg-border-secondary" />
        <div className="text-center">
          <p className="text-[11px] text-text-muted">Total convs.</p>
          <p className="text-[14px] font-semibold text-text-primary">{stats.conversaciones_recibidas}</p>
        </div>
      </div>
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 shadow-sm animate-pulse h-full">
      <div className="h-4 w-32 bg-border-secondary rounded mb-2" />
      <div className="h-10 w-24 bg-border-secondary rounded mb-4" />
      <div className="h-16 bg-border-secondary rounded" />
    </div>
  );
}
