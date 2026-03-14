"use client";

import { cn } from "@/lib/utils";
import {
  MessageCircle,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  type LucideIcon,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
  delta?: number;
}

function DeltaBadge({ delta }: { delta: number }) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md",
        isNeutral && "bg-gray-100 text-gray-500",
        isPositive && "bg-emerald-50 text-emerald-600",
        !isPositive && !isNeutral && "bg-red-50 text-red-600"
      )}
    >
      {isNeutral ? (
        <Minus size={10} />
      ) : isPositive ? (
        <ArrowUpRight size={10} />
      ) : (
        <ArrowDownRight size={10} />
      )}
      {Math.abs(delta)}%
    </span>
  );
}

export function KPICard({ title, value, icon: Icon, accent, delta }: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5",
        accent
          ? "text-white shadow-md"
          : "bg-bg-secondary border border-border-secondary shadow-sm hover:shadow-md"
      )}
      style={accent ? { background: "var(--gradient-dark)" } : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={cn(
              "text-[12px] font-medium",
              accent ? "text-white/70" : "text-text-muted"
            )}
          >
            {title}
          </p>
          <p className={cn("text-[28px] font-bold mt-1 tracking-tight", accent ? "text-white" : "text-text-primary")}>
            {value}
          </p>
          {delta !== undefined && (
            <div className="mt-1.5">
              {accent ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md",
                    delta === 0 && "bg-white/15 text-white/70",
                    delta > 0 && "bg-emerald-400/20 text-emerald-300",
                    delta < 0 && "bg-red-400/20 text-red-300"
                  )}
                >
                  {delta === 0 ? (
                    <Minus size={10} />
                  ) : delta > 0 ? (
                    <ArrowUpRight size={10} />
                  ) : (
                    <ArrowDownRight size={10} />
                  )}
                  {Math.abs(delta)}%
                </span>
              ) : (
                <DeltaBadge delta={delta} />
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            accent ? "bg-white/20" : "bg-accent/10"
          )}
        >
          <Icon
            size={20}
            className={accent ? "text-white" : "text-accent"}
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
      />
      <KPICard
        title="Leads calificados"
        value={qualifiedLeads}
        icon={UserCheck}
        delta={deltas?.leads}
      />
      <KPICard
        title="Citas agendadas"
        value={scheduledAppointments}
        icon={CalendarCheck}
        delta={deltas?.citas}
      />
      <KPICard
        title="Conversión"
        value={`${conversionRate}%`}
        icon={TrendingUp}
        delta={deltas?.conversion}
      />
    </div>
  );
}
