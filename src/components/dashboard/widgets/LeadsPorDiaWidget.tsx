"use client";

import { LeadsChart } from "../LeadsChart";
import { ChartEmpty } from "../ServiciosChart";
import type { WidgetProps } from "@/types/dashboard";

export function LeadsPorDiaWidget({ stats }: WidgetProps) {
  if (!stats) {
    return (
      <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 animate-pulse h-[280px]" />
    );
  }
  if (!stats.funnel || stats.funnel.length === 0) {
    return <ChartEmpty label="Sin datos de leads" />;
  }
  return <LeadsChart data={stats.funnel} />;
}
