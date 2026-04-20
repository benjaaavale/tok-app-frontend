"use client";

import { useState, useCallback, useRef } from "react";
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

// Auto-sort nuevos widgets por tamaño (lg → md → sm) para minimizar gaps.
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

  // Drag state
  const draggingIdRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDateChange = useCallback((from: string, to: string) => {
    setDateRange({ from, to });
  }, []);

  const handleDrop = (targetId: string) => {
    const sourceId = draggingIdRef.current;
    draggingIdRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) return;

    const next = [...selectedWidgets];
    const from = next.indexOf(sourceId);
    const to = next.indexOf(targetId);
    if (from === -1 || to === -1) return;
    next.splice(from, 1);
    next.splice(to, 0, sourceId);
    updateLayout(next);
  };

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
            Arrastra desde el handle de cada widget para reordenar.
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start grid-flow-dense">
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
                  isDragging={draggingId === id}
                  isDragOver={dragOverId === id && draggingId !== id}
                  onDragStart={() => {
                    draggingIdRef.current = id;
                    setDraggingId(id);
                  }}
                  onDragEnd={() => {
                    draggingIdRef.current = null;
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  onDragEnter={() => setDragOverId(id)}
                  onDrop={() => handleDrop(id)}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Customizer modal */}
      <DashboardCustomizerModal
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        selected={selectedWidgets}
        onSave={(ids) => {
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
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: {
  id: string;
  def: WidgetDefinition;
  stats?: DashboardStats;
  dateRange: { from: string; to: string };
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDrop: () => void;
}) {
  const [handleActive, setHandleActive] = useState(false);
  const Component = def.component;
  if (!Component) return null;

  return (
    <div
      draggable={handleActive}
      onDragStart={(e) => {
        if (!handleActive) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = "move";
        // Necesario para Firefox
        try {
          e.dataTransfer.setData("text/plain", id);
        } catch {}
        onDragStart();
      }}
      onDragEnd={() => {
        setHandleActive(false);
        onDragEnd();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        setHandleActive(false);
        onDrop();
      }}
      className={cn(
        SIZE_TO_COLSPAN[def.size],
        "relative group min-h-[100px] transition-all",
        isDragging && "opacity-40 scale-[0.98]",
        isDragOver &&
          "ring-2 ring-accent ring-offset-2 ring-offset-bg-primary rounded-2xl"
      )}
    >
      {/* Drag handle — solo activa draggable cuando el usuario lo toma */}
      <button
        type="button"
        aria-label="Arrastrar para reordenar"
        title="Arrastrar para reordenar"
        onMouseDown={() => setHandleActive(true)}
        onMouseUp={() => setHandleActive(false)}
        onTouchStart={() => setHandleActive(true)}
        onTouchEnd={() => setHandleActive(false)}
        className={cn(
          "absolute top-2 right-2 z-20 w-7 h-7 rounded-lg",
          "bg-bg-primary/90 border border-border-secondary backdrop-blur-sm",
          "flex items-center justify-center text-text-muted",
          "hover:text-text-primary hover:bg-bg-hover",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "cursor-grab active:cursor-grabbing"
        )}
      >
        <GripVertical size={13} />
      </button>
      <Component stats={stats} dateRange={dateRange} />
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
