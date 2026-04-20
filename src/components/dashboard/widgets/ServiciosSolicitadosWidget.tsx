"use client";

import { ServiciosChart } from "../ServiciosChart";
import { ChartEmpty } from "../ServiciosChart";
import type { WidgetProps } from "@/types/dashboard";

export function ServiciosSolicitadosWidget({ stats }: WidgetProps) {
  if (!stats) {
    return (
      <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 animate-pulse h-[280px]" />
    );
  }
  if (!stats.servicios_mas_solicitados || stats.servicios_mas_solicitados.length === 0) {
    return <ChartEmpty label="Sin datos de servicios" />;
  }
  return <ServiciosChart data={stats.servicios_mas_solicitados} />;
}
