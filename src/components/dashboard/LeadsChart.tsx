"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ETAPA_COLORS, ETAPA_LABELS } from "@/lib/constants";
import { ChartCard, ChartEmpty } from "./ServiciosChart";

interface LeadsChartProps {
  data: { etapa: string; cantidad: number }[];
}

export function LeadsChart({ data }: LeadsChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmpty label="Sin datos de leads" />;
  }

  const chartData = data.map((d) => ({
    name: ETAPA_LABELS[d.etapa] || d.etapa,
    value: d.cantidad,
    color: ETAPA_COLORS[d.etapa] || "#94A3B8",
  }));

  return (
    <ChartCard
      title="Leads por etapa"
      description="Distribución actual de tus contactos según la etapa en la que se encuentran en el proceso de venta."
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border-secondary)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "var(--text-secondary)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
