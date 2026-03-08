"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

interface ServiciosChartProps {
  data: { name: string; value: number }[];
}

export function ServiciosChart({ data }: ServiciosChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmpty label="Sin datos de servicios" />;
  }

  return (
    <ChartCard title="Servicios">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
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

// Shared chart wrapper
export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 shadow-sm">
      <h3 className="text-[13px] font-semibold text-text-primary mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-2xl p-5 shadow-sm flex items-center justify-center h-[280px]">
      <p className="text-[13px] text-text-muted">{label}</p>
    </div>
  );
}
