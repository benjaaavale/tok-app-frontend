"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { DashboardCustomizerModal } from "@/components/dashboard/DashboardCustomizerModal";
import { KPIGrid } from "@/components/dashboard/KPICard";
import { ServiciosChart } from "@/components/dashboard/ServiciosChart";
import { HorariosChart } from "@/components/dashboard/HorariosChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { InfoTooltip } from "@/components/dashboard/InfoTooltip";
import { UsageCard } from "@/components/settings/UsageCard";
import {
  getWidgetById,
  WIDGET_REGISTRY,
} from "@/components/dashboard/widgetRegistryComponents";
import {
  MessageSquare,
  BarChart3,
  Clock,
  SlidersHorizontal,
  MoreVertical,
  Check,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WidgetSize,
  WidgetDefinition,
  WidgetCategory,
} from "@/types/dashboard";
import { CATEGORY_LABELS } from "@/types/dashboard";
import type { DashboardStats } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";

// Colspan en grid de 3 columnas
const SIZE_TO_SPAN: Record<WidgetSize, number> = { sm: 1, md: 2, lg: 3 };
const SPAN_TO_CLASS: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-1 lg:col-span-2",
  3: "col-span-1 lg:col-span-3",
};
const TOTAL_COLS = 3;

// Ordena widgets nuevos por tamaño (lg → md → sm) para minimizar gaps.
const SIZE_WEIGHT: Record<WidgetSize, number> = { lg: 0, md: 1, sm: 2 };
function autoSort(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const da = WIDGET_REGISTRY.find((w) => w.id === a);
    const db = WIDGET_REGISTRY.find((w) => w.id === b);
    if (!da || !db) return 0;
    return SIZE_WEIGHT[da.size] - SIZE_WEIGHT[db.size];
  });
}

// Calcula el "span efectivo" de cada widget extra para evitar huecos:
// si el último widget deja espacio vacío en su fila, se extiende.
function computeEffectiveSpans(
  ids: string[]
): { id: string; span: number; def: WidgetDefinition }[] {
  const rows: { id: string; span: number; def: WidgetDefinition }[] = [];
  let col = 0;

  for (let i = 0; i < ids.length; i++) {
    const def = WIDGET_REGISTRY.find((w) => w.id === ids[i]);
    if (!def) continue;
    const baseSpan = SIZE_TO_SPAN[def.size];
    let span = baseSpan;

    if (col + span > TOTAL_COLS) col = 0;

    const isLast = i === ids.length - 1;
    if (isLast && col + span < TOTAL_COLS) {
      span = TOTAL_COLS - col;
    }

    rows.push({ id: ids[i], span, def });
    col = (col + span) % TOTAL_COLS;
  }

  return rows;
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

  const extras = useMemo(
    () => computeEffectiveSpans(selectedWidgets),
    [selectedWidgets]
  );

  const handleSwap = (currentId: string, newId: string) => {
    if (currentId === newId) return;
    const next = [...selectedWidgets];
    const idx = next.indexOf(currentId);
    if (idx === -1) return;
    const newIdx = next.indexOf(newId);
    if (newIdx !== -1) {
      next[idx] = newId;
      next[newIdx] = currentId;
    } else {
      next[idx] = newId;
    }
    updateLayout(next);
  };

  const handleRemove = (id: string) => {
    updateLayout(selectedWidgets.filter((w) => w !== id));
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

      {isLoading ? (
        <DashboardSkeleton />
      ) : stats ? (
        <>
          {/* ── Layout fijo ─────────────────────────────────────── */}

          {/* KPIs principales */}
          <KPIGrid
            totalConversations={stats.conversaciones_recibidas}
            qualifiedLeads={stats.leads_calificados}
            scheduledAppointments={stats.citas_generadas}
            conversionRate={stats.conversion_a_cita}
            deltas={
              stats.deltas
                ? {
                    conversaciones: stats.deltas.conversaciones,
                    leads: stats.deltas.leads,
                    citas: stats.deltas.citas,
                    conversion: stats.deltas.conversion,
                  }
                : undefined
            }
          />

          {/* Consumo del mes */}
          <UsageCard />

          {/* Mini stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <MiniStat
              icon={<MessageSquare size={14} />}
              label="Total mensajes"
              value={stats.mensajes_totales}
              delta={stats.deltas?.mensajes}
              description="Suma total de mensajes enviados y recibidos en todas las conversaciones del período."
            />
            <MiniStat
              icon={<BarChart3 size={14} />}
              label="Promedio msg/conv"
              value={stats.promedio_mensajes}
              delta={stats.deltas?.promedio}
              description="Mensajes promedio por conversación. Conversaciones más largas suelen indicar mayor interés o dudas del cliente."
            />
            <MiniStat
              icon={<Clock size={14} />}
              label="Leads fuera de horario"
              value={stats.leads_fuera_de_horario}
              delta={stats.deltas?.fuera_horario}
              description="Clientes que escribieron fuera de tu horario de atención. El agente IA responde igualmente para no perder oportunidades."
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ServiciosChart data={stats.servicios_mas_solicitados} />
            <HorariosChart data={stats.horarios_mas_actividad} />
            <FunnelChart data={stats.funnel} />
            <LeadsChart data={stats.funnel} />
          </div>

          {/* ── Extras configurables ───────────────────────────── */}
          {extras.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">
                  Estadísticas adicionales
                </h2>
                <span className="text-[10px] text-text-muted">
                  {extras.length} widget{extras.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start grid-flow-dense">
                {extras.map(({ id, span, def }) => (
                  <WidgetSlot
                    key={id}
                    id={id}
                    def={def}
                    span={span}
                    stats={stats ?? undefined}
                    dateRange={dateRange}
                    selectedIds={selectedWidgets}
                    onSwap={(newId) => handleSwap(id, newId)}
                    onRemove={() => handleRemove(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Call-to-action para agregar estadísticas */}
          {extras.length === 0 && (
            <button
              onClick={() => setCustomizerOpen(true)}
              className={cn(
                "w-full py-4 rounded-2xl border border-dashed",
                "border-border-secondary text-text-muted",
                "hover:border-accent hover:text-accent hover:bg-accent/5",
                "transition-all flex items-center justify-center gap-2 text-[12px] font-medium"
              )}
            >
              <Plus size={14} />
              Agregar más estadísticas al dashboard
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-text-muted text-[14px]">
          No hay datos para el período seleccionado
        </div>
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

/* ─────────────────────────────────────────────────────────────────── */
/* MiniStat (del layout clásico)                                        */
/* ─────────────────────────────────────────────────────────────────── */

function MiniStat({
  icon,
  label,
  value,
  delta,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  delta?: number;
  description?: string;
}) {
  return (
    <div className="bg-bg-secondary border border-border-secondary rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 shadow-sm overflow-visible">
      <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] text-text-muted truncate">
            {label}
          </p>
          {description && <InfoTooltip text={description} />}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p className="text-[15px] sm:text-[16px] font-semibold text-text-primary">
            {value}
          </p>
          {delta !== undefined && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold sm:px-1.5 sm:py-0.5 sm:rounded-md sm:border sm:border-border-secondary sm:bg-bg-primary">
              <svg
                width="6"
                height="5"
                viewBox={delta === 0 ? "0 0 6 8" : "0 0 8 6"}
                fill="currentColor"
                className={cn(
                  delta === 0 && "text-gray-400",
                  delta > 0 && "text-emerald-500",
                  delta < 0 && "text-red-500"
                )}
              >
                {delta === 0 ? (
                  <path d="M6 4L0 8V0L6 4Z" />
                ) : delta > 0 ? (
                  <path d="M4 0L8 6H0L4 0Z" />
                ) : (
                  <path d="M4 6L0 0H8L4 6Z" />
                )}
              </svg>
              <span
                className={cn(
                  delta === 0 && "text-gray-400",
                  delta > 0 && "text-emerald-500",
                  delta < 0 && "text-red-500"
                )}
              >
                {Math.abs(delta)}%
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Extras: widget con menu swap/remove                                  */
/* ─────────────────────────────────────────────────────────────────── */

function WidgetSlot({
  id,
  def,
  span,
  stats,
  dateRange,
  selectedIds,
  onSwap,
  onRemove,
}: {
  id: string;
  def: WidgetDefinition;
  span: number;
  stats?: DashboardStats;
  dateRange: { from: string; to: string };
  selectedIds: string[];
  onSwap: (newId: string) => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const Component = def.component;

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  if (!Component) return null;

  return (
    <div
      ref={wrapperRef}
      className={cn(SPAN_TO_CLASS[span], "relative group min-h-[100px]")}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        aria-label="Opciones del widget"
        title="Cambiar estadística"
        className={cn(
          "absolute top-2 right-2 z-20 w-7 h-7 rounded-lg",
          "bg-bg-primary/90 border border-border-secondary backdrop-blur-sm",
          "flex items-center justify-center text-text-muted",
          "hover:text-text-primary hover:bg-bg-hover transition-all",
          menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <MoreVertical size={13} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute top-11 right-2 z-30 w-64 max-h-[340px] overflow-y-auto",
              "rounded-xl bg-bg-primary border border-border-secondary shadow-xl p-1"
            )}
          >
            <div className="px-2.5 py-2 border-b border-border-secondary mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Mostrar en este cuadro
              </span>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRemove();
                }}
                className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-500/10 transition-all"
                title="Quitar widget"
              >
                <Trash2 size={10} />
                Quitar
              </button>
            </div>

            <WidgetPicker
              currentId={id}
              selectedIds={selectedIds}
              onPick={(newId) => {
                setMenuOpen(false);
                onSwap(newId);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Component stats={stats} dateRange={dateRange} />
    </div>
  );
}

function WidgetPicker({
  currentId,
  selectedIds,
  onPick,
}: {
  currentId: string;
  selectedIds: string[];
  onPick: (id: string) => void;
}) {
  const byCategory = useMemo(() => {
    const map = new Map<WidgetCategory, WidgetDefinition[]>();
    for (const w of WIDGET_REGISTRY) {
      if (!map.has(w.category)) map.set(w.category, []);
      map.get(w.category)!.push(w);
    }
    return map;
  }, []);

  const categoriesOrdered: WidgetCategory[] = [
    "general",
    "conversion",
    "equipo",
    "tiempos",
    "ia",
  ];

  return (
    <div className="space-y-2">
      {categoriesOrdered.map((cat) => {
        const widgets = byCategory.get(cat);
        if (!widgets || widgets.length === 0) return null;
        return (
          <div key={cat}>
            <p className="px-2.5 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {CATEGORY_LABELS[cat]}
            </p>
            {widgets.map((w) => {
              const isCurrent = w.id === currentId;
              const isUsed = selectedIds.includes(w.id) && !isCurrent;
              return (
                <button
                  key={w.id}
                  onClick={() => onPick(w.id)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg flex items-start gap-2 transition-all",
                    isCurrent
                      ? "bg-accent/10 text-text-primary"
                      : "hover:bg-bg-hover text-text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border",
                      isCurrent
                        ? "bg-accent border-accent"
                        : "border-border-secondary bg-bg-secondary"
                    )}
                  >
                    {isCurrent && (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    )}
                    {!isCurrent && isUsed && (
                      <span className="w-1 h-1 rounded-full bg-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-text-primary leading-tight">
                      {w.title}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2 leading-snug">
                      {w.description}
                    </p>
                    {isUsed && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-text-muted mt-0.5">
                        Se intercambiará con el cuadro donde está ahora
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[100px] bg-bg-secondary rounded-xl border border-border-secondary"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-[56px] sm:h-[60px] bg-bg-secondary rounded-xl border border-border-secondary"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[280px] bg-bg-secondary rounded-xl border border-border-secondary"
          />
        ))}
      </div>
    </div>
  );
}
