"use client";

import { cn } from "@/lib/utils";
import {
  MessageCircle,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
  delta?: number;
  description?: string;
}

function TriangleUp({ className }: { className?: string }) {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor" className={className}>
      <path d="M4 0L8 6H0L4 0Z" />
    </svg>
  );
}

function TriangleDown({ className }: { className?: string }) {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor" className={className}>
      <path d="M4 6L0 0H8L4 6Z" />
    </svg>
  );
}

function TriangleRight({ className }: { className?: string }) {
  return (
    <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor" className={className}>
      <path d="M6 4L0 8V0L6 4Z" />
    </svg>
  );
}

function DeltaBadge({ delta, onDark }: { delta: number; onDark?: boolean }) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  const colorClass = isNeutral
    ? onDark ? "text-white/50" : "text-gray-400"
    : isPositive
    ? "text-emerald-500"
    : "text-red-500";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-semibold",
        // On mobile: plain text, no badge. On sm+: badge with border
        "sm:px-2 sm:py-0.5 sm:rounded-md sm:border",
        onDark
          ? "sm:border-white/15 sm:bg-white/5"
          : "sm:border-border-secondary sm:bg-bg-primary"
      )}
    >
      {isNeutral ? (
        <TriangleRight className={colorClass} />
      ) : isPositive ? (
        <TriangleUp className={colorClass} />
      ) : (
        <TriangleDown className={colorClass} />
      )}
      <span className={colorClass}>{Math.abs(delta)}%</span>
    </span>
  );
}

export function KPICard({ title, value, icon: Icon, accent, delta, description }: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-3.5 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 overflow-visible",
        accent
          ? "text-white shadow-md"
          : "bg-bg-secondary border border-border-secondary shadow-sm hover:shadow-md"
      )}
      style={accent ? { background: "var(--gradient-dark)" } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <p
              className={cn(
                "text-[11px] sm:text-[12px] font-medium truncate",
                accent ? "text-white/70" : "text-text-muted"
              )}
            >
              {title}
            </p>
            {description && <InfoTooltip text={description} onDark={accent} />}
          </div>
          <p className={cn("text-[22px] sm:text-[28px] font-bold mt-0.5 sm:mt-1 tracking-tight", accent ? "text-white" : "text-text-primary")}>
            {value}
          </p>
          {delta !== undefined && (
            <div className="mt-1">
              <DeltaBadge delta={delta} onDark={accent} />
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            accent ? "bg-white/20" : "bg-accent/10"
          )}
        >
          <Icon
            size={18}
            className={cn("sm:!w-5 sm:!h-5", accent ? "text-white" : "text-accent")}
          />
        </div>
      </div>
    </div>
  );
}

// Convenience grid
interface KPIGridProps {
  totalConversations: number;
  qualifiedLeads: number;
  scheduledAppointments: number;
  conversionRate: number;
  deltas?: {
    conversaciones: number;
    leads: number;
    citas: number;
    conversion: number;
  };
}

export function KPIGrid({
  totalConversations,
  qualifiedLeads,
  scheduledAppointments,
  conversionRate,
  deltas,
}: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Conversaciones"
        value={totalConversations}
        icon={MessageCircle}
        accent
        delta={deltas?.conversaciones}
        description="Total de conversaciones nuevas iniciadas en el período seleccionado. Cuenta cada chat único que llegó por WhatsApp, Messenger o Instagram."
      />
      <KPICard
        title="Leads calificados"
        value={qualifiedLeads}
        icon={UserCheck}
        delta={deltas?.leads}
        description="Conversaciones donde el cliente mostró intención clara de compra o contratación. Son los contactos con mayor probabilidad de convertirse en cita."
      />
      <KPICard
        title="Citas agendadas"
        value={scheduledAppointments}
        icon={CalendarCheck}
        delta={deltas?.citas}
        description="Cantidad de citas confirmadas a través del agente IA o manualmente durante el período."
      />
      <KPICard
        title="Conversión"
        value={`${conversionRate}%`}
        icon={TrendingUp}
        delta={deltas?.conversion}
        description="Porcentaje de conversaciones que terminaron en cita agendada. Se calcula como citas agendadas ÷ conversaciones recibidas."
      />
    </div>
  );
}
