"use client";

import { useState, useCallback } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { DashboardCustomizerModal } from "@/components/dashboard/DashboardCustomizerModal";
import { getWidgetById } from "@/components/dashboard/widgetRegistryComponents";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetSize } from "@/types/dashboard";

// Map widget size to CSS col-span in a 3-col grid
const SIZE_TO_COLSPAN: Record<WidgetSize, string> = {
  sm: "col-span-1",
  md: "col-span-1 lg:col-span-2",
  lg: "col-span-1 lg:col-span-3",
};

export default function DashboardPage() {
  const { companyNombre } = useAuthStore();

  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [dateRange, setDateRange] = useState({ from: defaultFrom, to: defaultTo });
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { data: stats, isLoading } = useDashboardStats(dateRange.from, dateRange.to);
  const { selectedWidgets, updateLayout } = useDashboardLayout();

  const handleDateChange = useCallback((from: string, to: string) => {
    setDateRange({ from, to });
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary tracking-tight">
            Hola, {companyNombre || "bienvenido"} 👋
          </h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            Resumen de actividad de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangeFilter onChange={handleDateChange} />
          <button
            onClick={() => setCustomizerOpen(true)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium",
              "border border-border-secondary bg-bg-secondary",
              "hover:border-accent hover:text-accent transition-all"
            )}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Personalizar</span>
          </button>
        </div>
      </div>

      {/* Widget grid */}
      {isLoading ? (
        <DashboardSkeleton count={selectedWidgets.length} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {selectedWidgets.map((id) => {
            const def = getWidgetById(id);
            if (!def) return null;
            const Component = def.component;
            if (!Component) return null;

            return (
              <div
                key={id}
                className={cn(SIZE_TO_COLSPAN[def.size], "min-h-[100px]")}
              >
                <Component
                  stats={stats ?? undefined}
                  dateRange={dateRange}
                />
              </div>
            );
          })}

          {selectedWidgets.length === 0 && (
            <div className="col-span-1 lg:col-span-3 py-16 flex flex-col items-center gap-3 text-center">
              <SlidersHorizontal size={32} className="text-text-muted opacity-40" />
              <p className="text-[14px] text-text-muted">
                No hay widgets seleccionados.
              </p>
              <button
                onClick={() => setCustomizerOpen(true)}
                className="btn-gradient px-4 py-2 rounded-xl text-[13px] font-medium mt-1"
              >
                Personalizar dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customizer modal */}
      <DashboardCustomizerModal
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        selected={selectedWidgets}
        onSave={updateLayout}
      />
    </div>
  );
}

function DashboardSkeleton({ count }: { count: number }) {
  const heights = ["h-[100px]", "h-[280px]", "h-[280px]", "h-[200px]", "h-[100px]"];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: Math.max(count, 2) }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-bg-secondary rounded-xl border border-border-secondary",
            heights[i % heights.length],
            i % 3 === 1 ? "lg:col-span-2" : ""
          )}
        />
      ))}
    </div>
  );
}
