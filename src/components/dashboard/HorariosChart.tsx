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
import { ChartCard, ChartEmpty } from "./ServiciosChart";

interface HorariosChartProps {
  data: { hour: string; count: number }[];
}

export function HorariosChart({ data }: HorariosChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmpty label="Sin datos de actividad" />;
  }

  return (
    <ChartCard title="Actividad por hora">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-secondary)"
            vertical={false}
          />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={30}
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
          <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
