"use client";

import { FunnelChart } from "../FunnelChart";
import { ChartEmpty } from "../ServiciosChart";
import type { WidgetProps } from "@/types/dashboard";

export function FunnelEtapasWidget({ stats }: WidgetProps) {
  if (!stats) {
    return (
      <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 animate-pulse h-[280px]" />
    );
  }
  if (!stats.funnel || stats.funnel.length === 0) {
    return <ChartEmpty label="Sin datos del funnel" />;
  }
  return <FunnelChart data={stats.funnel} />;
}
