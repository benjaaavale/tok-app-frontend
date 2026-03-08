"use client";

import { cn } from "@/lib/utils";
import {
  MessageCircle,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}

export function KPICard({ title, value, icon: Icon, accent }: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 transition-shadow duration-200",
        accent
          ? "bg-accent text-white shadow-md"
          : "bg-bg-secondary border border-border-secondary shadow-sm hover:shadow-md"
      )}
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
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
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
}

export function KPIGrid({
  totalConversations,
  qualifiedLeads,
  scheduledAppointments,
  conversionRate,
}: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Conversaciones"
        value={totalConversations}
        icon={MessageCircle}
        accent
      />
      <KPICard
        title="Leads calificados"
        value={qualifiedLeads}
        icon={UserCheck}
      />
      <KPICard
        title="Citas agendadas"
        value={scheduledAppointments}
        icon={CalendarCheck}
      />
      <KPICard
        title="Conversi\u00f3n"
        value={`${conversionRate}%`}
        icon={TrendingUp}
      />
    </div>
  );
}
