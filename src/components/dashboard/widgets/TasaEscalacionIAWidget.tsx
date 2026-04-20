"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Bot } from "lucide-react";
import { ChartCard } from "../ServiciosChart";
import type { WidgetProps } from "@/types/dashboard";

// TODO: conectar endpoint real /stats/ia que retorne { resueltos_ia, escalados_humano, total_procesados }
// Por ahora usa datos mock realistas
const MOCK_DATA = {
  resueltos_ia: 68,
  escalados_humano: 32,
  total_procesados: 100,
};

const COLORS = ["#8B5CF6", "#3B82F6"];

export function TasaEscalacionIAWidget(_props: WidgetProps) {
  const data = MOCK_DATA;
  const tasaEscalacion = data.total_procesados > 0
    ? Math.round((data.escalados_humano / data.total_procesados) * 100)
    : 0;

  const chartData = [
    { name: "Resuelto por IA", value: data.resueltos_ia },
    { name: "Escalado a humano", value: data.escalados_humano },
  ];

  return (
    <ChartCard
      title="Distribucion IA vs humano"
      description="Porcentaje de conversaciones resueltas completamente por el agente IA versus las que requirieron intervencion humana."
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col justify-center">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
            <Bot size={16} className="text-accent" />
          </div>
          <p className="text-[10px] text-text-muted">Tasa escalacion</p>
          <p className="text-[24px] font-bold text-text-primary">{tasaEscalacion}%</p>
          <p className="text-[10px] text-text-muted mt-1 italic">Datos mock</p>
        </div>

        <div className="flex-1 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, i) => (
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
                formatter={(v) => [`${v}%`, ""]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px", color: "var(--text-secondary)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}
