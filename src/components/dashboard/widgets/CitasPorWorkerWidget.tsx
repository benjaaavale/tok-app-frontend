"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Users } from "lucide-react";
import { useWorkers } from "@/hooks/useWorkers";
import { useAppointments } from "@/hooks/useAppointments";
import type { WidgetProps } from "@/types/dashboard";
import { ChartCard, ChartEmpty } from "../ServiciosChart";

// TODO: conectar endpoint real para citas por worker en rango de fechas
// Por ahora calcula desde appointments actuales (sin filtro de fecha exacto por range)
export function CitasPorWorkerWidget({ dateRange }: WidgetProps) {
  const { data: workers } = useWorkers();
  const { data: appointments } = useAppointments();

  if (!workers || !appointments) {
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

  // Filtra appointments por rango si hay dateRange
  const filtered = dateRange
    ? appointments.filter((a) => {
        if (!a.fecha) return false;
        return a.fecha >= dateRange.from && a.fecha <= dateRange.to;
      })
    : appointments;

  const citasPorWorker = activeWorkers.map((w) => ({
    name: w.nombre,
    Citas: filtered.filter((a) => a.worker_id === w.id).length,
    color: w.color || "#8B5CF6",
  }));

  const hasData = citasPorWorker.some((d) => d.Citas > 0);
  if (!hasData) {
    return <ChartEmpty label="Sin citas para el período" />;
  }

  return (
    <ChartCard
      title="Citas por worker"
      description="Distribucion de citas agendadas por cada worker activo en el período seleccionado."
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={citasPorWorker} layout="vertical" barCategoryGap="25%">
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border-secondary)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="Citas" radius={[0, 6, 6, 0]}>
            {citasPorWorker.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
