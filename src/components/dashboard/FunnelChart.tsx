"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ETAPA_LABELS } from "@/lib/constants";
import { ChartCard, ChartEmpty } from "./ServiciosChart";

interface FunnelChartProps {
  data: { etapa: string; cantidad: number }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmpty label="Sin datos del funnel" />;
  }

  const chartData = data.map((d) => ({
    stage: ETAPA_LABELS[d.etapa] || d.etapa,
    Cantidad: d.cantidad,
  }));

  return (
    <ChartCard title="Funnel de conversión">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" barCategoryGap="25%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-secondary)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="stage"
            tick={{ fontSize: 11, fill: "var(--text-secondary)", style: { whiteSpace: "nowrap" } }}
            axisLine={false}
            tickLine={false}
            width={120}
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
          <Bar dataKey="Cantidad" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
