"use client";

import { useState, useCallback } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuthStore } from "@/stores/auth-store";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { KPIGrid } from "@/components/dashboard/KPICard";
import { ServiciosChart } from "@/components/dashboard/ServiciosChart";
import { HorariosChart } from "@/components/dashboard/HorariosChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { MessageSquare, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/dashboard/InfoTooltip";

export default function DashboardPage() {
  const { companyNombre } = useAuthStore();

  // Default to current month
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [dateRange, setDateRange] = useState({ from: defaultFrom, to: defaultTo });
  const { data: stats, isLoading } = useDashboardStats(dateRange.from, dateRange.to);

  const handleDateChange = useCallback((from: string, to: string) => {
    setDateRange({ from, to });
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary tracking-tight">
            Hola, {companyNombre || "bienvenido"} 👋
          </h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            Resumen de actividad de tu negocio
          </p>
        </div>
        <DateRangeFilter onChange={handleDateChange} />
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : stats ? (
        <>
          {/* KPIs */}
          <KPIGrid
            totalConversations={stats.conversaciones_recibidas}
            qualifiedLeads={stats.leads_calificados}
            scheduledAppointments={stats.citas_generadas}
            conversionRate={stats.conversion_a_cita}
            deltas={stats.deltas ? {
              conversaciones: stats.deltas.conversaciones,
              leads: stats.deltas.leads,
              citas: stats.deltas.citas,
              conversion: stats.deltas.conversion,
            } : undefined}
          />

          {/* Mini stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <MiniStat
              icon={<MessageSquare size={14} />}
              label="Total mensajes"
              value={stats.mensajes_totales}
              delta={stats.deltas?.mensajes}
              description="Suma total de mensajes enviados y recibidos en todas las conversaciones del período."
            />
            <MiniStat
              icon={<BarChart3 size={14} />}
              label="Promedio msg/conv"
              value={stats.promedio_mensajes}
              delta={stats.deltas?.promedio}
              description="Mensajes promedio por conversación. Conversaciones más largas suelen indicar mayor interés o dudas del cliente."
            />
            <MiniStat
              icon={<Clock size={14} />}
              label="Leads fuera de horario"
              value={stats.leads_fuera_de_horario}
              delta={stats.deltas?.fuera_horario}
              description="Clientes que escribieron fuera de tu horario de atención. El agente IA responde igualmente para no perder oportunidades."
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ServiciosChart data={stats.servicios_mas_solicitados} />
            <HorariosChart data={stats.horarios_mas_actividad} />
            <FunnelChart data={stats.funnel} />
            <LeadsChart data={stats.funnel} />
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-text-muted text-[14px]">
          No hay datos para el período seleccionado
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  delta,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  delta?: number;
  description?: string;
}) {
  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 shadow-sm overflow-visible">
      <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] text-text-muted truncate">{label}</p>
          {description && <InfoTooltip text={description} />}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p className="text-[15px] sm:text-[16px] font-semibold text-text-primary">{value}</p>
          {delta !== undefined && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold sm:px-1.5 sm:py-0.5 sm:rounded-md sm:border sm:border-border-secondary sm:bg-bg-primary">
              <svg
                width="6"
                height="5"
                viewBox={delta === 0 ? "0 0 6 8" : "0 0 8 6"}
                fill="currentColor"
                className={cn(
                  delta === 0 && "text-gray-400",
                  delta > 0 && "text-emerald-500",
                  delta < 0 && "text-red-500"
                )}
              >
                {delta === 0 ? (
                  <path d="M6 4L0 8V0L6 4Z" />
                ) : delta > 0 ? (
                  <path d="M4 0L8 6H0L4 0Z" />
                ) : (
                  <path d="M4 6L0 0H8L4 6Z" />
                )}
              </svg>
              <span className={cn(
                delta === 0 && "text-gray-400",
                delta > 0 && "text-emerald-500",
                delta < 0 && "text-red-500"
              )}>
                {Math.abs(delta)}%
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[100px] bg-bg-secondary rounded-xl border border-border-secondary" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[56px] sm:h-[60px] bg-bg-secondary rounded-xl border border-border-secondary" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[280px] bg-bg-secondary rounded-xl border border-border-secondary" />
        ))}
      </div>
    </div>
  );
}
