"use client";

import { useState, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { DashboardCustomizerModal } from "@/components/dashboard/DashboardCustomizerModal";
import { getWidgetById, WIDGET_REGISTRY } from "@/components/dashboard/widgetRegistryComponents";
import { SlidersHorizontal, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetSize, WidgetDefinition } from "@/types/dashboard";
import type { DashboardStats } from "@/types/api";

// Map widget size to CSS col-span in a 3-col grid
const SIZE_TO_COLSPAN: Record<WidgetSize, string> = {
  sm: "col-span-1",
  md: "col-span-1 lg:col-span-2",
  lg: "col-span-1 lg:col-span-3",
};

// Orden interno recomendado: los widgets nuevos se insertan en el orden de tamaño
// (lg → md → sm) para evitar gaps visuales. El usuario puede reordenar con drag.
const SIZE_WEIGHT: Record<WidgetSize, number> = { lg: 0, md: 1, sm: 2 };
function autoSort(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const da = WIDGET_REGISTRY.find((w) => w.id === a);
    const db = WIDGET_REGISTRY.find((w) => w.id === b);
    if (!da || !db) return 0;
    return SIZE_WEIGHT[da.size] - SIZE_WEIGHT[db.size];
  });
}

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
      ) : selectedWidgets.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
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
      ) : (
        <>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <GripVertical size={12} />
            Arrastra los widgets para reordenar. Click en &quot;Personalizar&quot; para
            agregar más.
          </div>
          <Reorder.Group
            axis="y"
            values={selectedWidgets}
            onReorder={updateLayout}
            as="div"
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start grid-flow-dense"
          >
            {selectedWidgets.map((id) => {
              const def = getWidgetById(id);
              if (!def) return null;
              return (
                <DraggableWidget
                  key={id}
                  id={id}
                  def={def}
                  stats={stats ?? undefined}
                  dateRange={dateRange}
                />
              );
            })}
          </Reorder.Group>
        </>
      )}

      {/* Customizer modal */}
      <DashboardCustomizerModal
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        selected={selectedWidgets}
        onSave={(ids) => {
          // Conserva el orden existente para los widgets ya elegidos y
          // auto-ordena los nuevos por tamaño para evitar gaps visuales.
          const preserved = selectedWidgets.filter((id) => ids.includes(id));
          const added = ids.filter((id) => !selectedWidgets.includes(id));
          updateLayout([...preserved, ...autoSort(added)]);
        }}
      />
    </div>
  );
}

function DraggableWidget({
  id,
  def,
  stats,
  dateRange,
}: {
  id: string;
  def: WidgetDefinition;
  stats?: DashboardStats;
  dateRange: { from: string; to: string };
}) {
  const controls = useDragControls();
  const Component = def.component;
  if (!Component) return null;
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className={cn(SIZE_TO_COLSPAN[def.size], "relative group min-h-[100px]")}
      whileDrag={{ scale: 1.02, zIndex: 50, cursor: "grabbing" }}
      layout
    >
      {/* Drag handle */}
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="absolute top-2 right-2 z-20 w-7 h-7 rounded-lg bg-bg-primary/80 border border-border-secondary flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-hover opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing backdrop-blur-sm"
        title="Arrastrar para reordenar"
        aria-label="Reordenar widget"
      >
        <GripVertical size={13} />
      </button>
      <Component stats={stats} dateRange={dateRange} />
    </Reorder.Item>
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
