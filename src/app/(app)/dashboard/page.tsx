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
            totalConversations={stats.total_conversations}
            qualifiedLeads={stats.qualified_leads}
            scheduledAppointments={stats.scheduled_appointments}
            conversionRate={stats.conversion_rate}
          />

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4">
            <MiniStat
              icon={<MessageSquare size={14} />}
              label="Total mensajes"
              value={stats.total_messages}
            />
            <MiniStat
              icon={<BarChart3 size={14} />}
              label="Promedio msg/conv"
              value={stats.avg_messages_per_conversation}
            />
            <MiniStat
              icon={<Clock size={14} />}
              label="Leads fuera de horario"
              value={stats.off_hours_leads}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ServiciosChart data={stats.servicios} />
            <HorariosChart data={stats.horarios} />
            <FunnelChart data={stats.funnel} />
            <LeadsChart data={stats.leads} />
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-text-muted text-[14px]">
          No hay datos para el per&iacute;odo seleccionado
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="text-[16px] font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[100px] bg-bg-secondary rounded-2xl border border-border-secondary" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[60px] bg-bg-secondary rounded-xl border border-border-secondary" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[280px] bg-bg-secondary rounded-2xl border border-border-secondary" />
        ))}
      </div>
    </div>
  );
}
