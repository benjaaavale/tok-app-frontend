"use client";

import { HorariosChart } from "../HorariosChart";
import { ChartEmpty } from "../ServiciosChart";
import type { WidgetProps } from "@/types/dashboard";

export function HorasPicoWidget({ stats }: WidgetProps) {
  if (!stats) {
    return (
      <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 animate-pulse h-[280px]" />
    );
  }
  if (!stats.horarios_mas_actividad || stats.horarios_mas_actividad.length === 0) {
    return <ChartEmpty label="Sin datos de actividad" />;
  }
  return <HorariosChart data={stats.horarios_mas_actividad} />;
}
